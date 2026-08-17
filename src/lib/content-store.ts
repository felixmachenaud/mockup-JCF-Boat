import { get, put } from "@vercel/blob";
import { unstable_cache, revalidateTag } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "./site-content";

const BLOB_KEY = "jcf-boat-site-content.json";
const REVISION_PREFIX = "jcf-boat-revisions/";
const CACHE_TAG = "jcf-site-content";
const LOCAL_PATH = path.join(process.cwd(), "data", "site-content.json");
const LOCAL_REVISIONS_DIR = path.join(process.cwd(), "data", "revisions");
const MAX_REVISIONS = 30;

const REVALIDATE_PROFILE = { expire: 0 } as const;

export type ContentMeta = {
  version: number;
  updatedAt: string;
  updatedBy: string;
};

export type StoredContentDocument = {
  meta: ContentMeta;
  content: SiteContent;
};

function blobConfigured() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function assertWritableStore(): void {
  if (isProduction() && !blobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN requis en production — stockage local éphémère interdit.",
    );
  }
}

function emptyMeta(): ContentMeta {
  return {
    version: 0,
    updatedAt: new Date(0).toISOString(),
    updatedBy: "system",
  };
}

function parseStoredDocument(raw: unknown): StoredContentDocument {
  if (!raw || typeof raw !== "object") {
    return { meta: emptyMeta(), content: structuredClone(DEFAULT_CONTENT) };
  }
  const obj = raw as Record<string, unknown>;

  // New wrapper format
  if (obj.content && typeof obj.content === "object" && obj.meta) {
    const meta = obj.meta as Partial<ContentMeta>;
    return {
      meta: {
        version: Number(meta.version) || 0,
        updatedAt: String(meta.updatedAt || new Date(0).toISOString()),
        updatedBy: String(meta.updatedBy || "system"),
      },
      content: mergeContent(obj.content as Partial<SiteContent>),
    };
  }

  // Legacy flat SiteContent JSON
  return {
    meta: emptyMeta(),
    content: mergeContent(obj as Partial<SiteContent>),
  };
}

async function readLocalDocument(): Promise<StoredContentDocument | null> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return parseStoredDocument(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeLocalDocument(doc: StoredContentDocument): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(doc, null, 2), "utf8");
}

async function fetchDocumentFromBlob(): Promise<StoredContentDocument | null> {
  if (!blobConfigured()) return null;
  try {
    const result = await get(BLOB_KEY, {
      access: "private",
      useCache: false,
    });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return parseStoredDocument(JSON.parse(text));
  } catch (err) {
    if (err instanceof Error && /not.?found/i.test(err.message)) return null;
    console.error("[content-store] blob read failed", err);
    return null;
  }
}

async function fetchDocument(): Promise<StoredContentDocument> {
  if (blobConfigured()) {
    const fromBlob = await fetchDocumentFromBlob();
    if (fromBlob) return fromBlob;
  } else if (!isProduction()) {
    const local = await readLocalDocument();
    if (local) return local;
  }
  return {
    meta: emptyMeta(),
    content: structuredClone(DEFAULT_CONTENT),
  };
}

const cachedGetDocument = unstable_cache(
  async (): Promise<StoredContentDocument> => fetchDocument(),
  ["jcf-site-content-doc-v1"],
  { tags: [CACHE_TAG], revalidate: 300 },
);

export async function getContent(): Promise<SiteContent> {
  try {
    return (await cachedGetDocument()).content;
  } catch {
    return (await fetchDocument()).content;
  }
}

export async function getContentDocument(): Promise<StoredContentDocument> {
  try {
    return await cachedGetDocument();
  } catch {
    return fetchDocument();
  }
}

async function writeRevisionSnapshot(
  previous: StoredContentDocument,
): Promise<void> {
  if (previous.meta.version <= 0) return;
  const stamp = `${previous.meta.version}-${Date.now()}`;
  const payload = JSON.stringify(previous);

  if (blobConfigured()) {
    await put(`${REVISION_PREFIX}${stamp}.json`, payload, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    // Retention: keep writing snapshots; prune locally below. Blob prune
    // (list + delete) can be added once a dedicated cleanup job exists.
    return;
  }

  await fs.mkdir(LOCAL_REVISIONS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(LOCAL_REVISIONS_DIR, `${stamp}.json`),
    payload,
    "utf8",
  );
  try {
    const files = (await fs.readdir(LOCAL_REVISIONS_DIR))
      .filter((f) => f.endsWith(".json"))
      .sort();
    const excess = files.length - MAX_REVISIONS;
    for (let i = 0; i < excess; i++) {
      await fs.unlink(path.join(LOCAL_REVISIONS_DIR, files[i]!));
    }
  } catch {
    // ignore
  }
}

function assertUniqueBoatSlugs(content: SiteContent): void {
  const slugs = content.boats.map((b) => b.slug).filter(Boolean);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Slugs bateaux en double");
  }
  const ids = content.boats.map((b) => b.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    throw new Error("IDs bateaux en double");
  }
}

export class ContentConflictError extends Error {
  constructor(
    public currentVersion: number,
    public updatedAt: string,
  ) {
    super("Conflict: le contenu a été modifié ailleurs");
    this.name = "ContentConflictError";
  }
}

export async function saveContent(
  next: SiteContent,
  opts: {
    expectedVersion: number;
    updatedBy?: string;
  },
): Promise<ContentMeta> {
  assertWritableStore();
  assertUniqueBoatSlugs(next);

  const current = await fetchDocument();
  if (current.meta.version !== opts.expectedVersion) {
    throw new ContentConflictError(
      current.meta.version,
      current.meta.updatedAt,
    );
  }

  await writeRevisionSnapshot(current);

  const meta: ContentMeta = {
    version: current.meta.version + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: opts.updatedBy || "admin",
  };
  const doc: StoredContentDocument = { meta, content: next };

  if (blobConfigured()) {
    await put(BLOB_KEY, JSON.stringify(doc, null, 2), {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
  } else {
    await writeLocalDocument(doc);
  }

  revalidateTag(CACHE_TAG, REVALIDATE_PROFILE);
  return meta;
}

export function isContentStoreConfigured() {
  if (isProduction()) return blobConfigured();
  return true;
}

export function isUsingBlobStore() {
  return blobConfigured();
}

export function getContentStoreMode(): "blob" | "local" | "unconfigured" {
  if (blobConfigured()) return "blob";
  if (isProduction()) return "unconfigured";
  return "local";
}
