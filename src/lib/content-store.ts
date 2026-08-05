import { get, put } from "@vercel/blob";
import { unstable_cache, revalidateTag } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "./site-content";

const BLOB_KEY = "jcf-boat-site-content.json";
const CACHE_TAG = "jcf-site-content";
const LOCAL_PATH = path.join(process.cwd(), "data", "site-content.json");

const REVALIDATE_PROFILE = { expire: 0 } as const;

function blobConfigured() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

async function readLocalOverrides(): Promise<Partial<SiteContent> | null> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return JSON.parse(raw) as Partial<SiteContent>;
  } catch {
    return null;
  }
}

async function writeLocal(content: SiteContent): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(content, null, 2), "utf8");
}

async function fetchOverridesFromBlob(): Promise<Partial<SiteContent> | null> {
  if (!blobConfigured()) return null;
  try {
    const result = await get(BLOB_KEY, {
      access: "private",
      useCache: false,
    });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Partial<SiteContent>;
  } catch (err) {
    if (err instanceof Error && /not.?found/i.test(err.message)) return null;
    console.error("[content-store] blob read failed", err);
    return null;
  }
}

async function fetchOverrides(): Promise<Partial<SiteContent> | null> {
  if (blobConfigured()) {
    const fromBlob = await fetchOverridesFromBlob();
    if (fromBlob) return fromBlob;
  }
  return readLocalOverrides();
}

const cachedGetContent = unstable_cache(
  async (): Promise<SiteContent> => {
    const overrides = await fetchOverrides();
    return mergeContent(overrides);
  },
  ["jcf-site-content-v1"],
  { tags: [CACHE_TAG], revalidate: 300 },
);

export async function getContent(): Promise<SiteContent> {
  try {
    return await cachedGetContent();
  } catch {
    const overrides = await fetchOverrides();
    return mergeContent(overrides);
  }
}

export async function saveContent(next: SiteContent): Promise<void> {
  if (blobConfigured()) {
    await put(BLOB_KEY, JSON.stringify(next, null, 2), {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
  } else {
    await writeLocal(next);
  }
  revalidateTag(CACHE_TAG, REVALIDATE_PROFILE);
}

export function isContentStoreConfigured() {
  return true; // Blob ou fichier local data/site-content.json
}

export function isUsingBlobStore() {
  return blobConfigured();
}

export function getContentStoreMode(): "blob" | "local" {
  return blobConfigured() ? "blob" : "local";
}
