import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";

export type AdminSession = {
  id: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  ipHash?: string;
  uaHash?: string;
};

type SessionStore = Record<string, AdminSession>;

const BLOB_KEY = "jcf-admin-sessions.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "admin-sessions.json");

function blobConfigured() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

function hashMeta(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

async function readStore(): Promise<SessionStore> {
  if (blobConfigured()) {
    try {
      const result = await get(BLOB_KEY, { access: "private", useCache: false });
      if (!result) return {};
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as SessionStore;
    } catch (err) {
      if (err instanceof Error && /not.?found/i.test(err.message)) return {};
      console.error("[admin-sessions] blob read failed", err);
      return {};
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return JSON.parse(raw) as SessionStore;
  } catch {
    return {};
  }
}

async function writeStore(store: SessionStore): Promise<void> {
  const now = Date.now();
  for (const [id, session] of Object.entries(store)) {
    if (session.expiresAt < now) delete store[id];
  }

  const payload = JSON.stringify(store);

  if (blobConfigured()) {
    await put(BLOB_KEY, payload, {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Session store requires Vercel Blob in production (BLOB_READ_WRITE_TOKEN).",
    );
  }

  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, payload, "utf8");
}

export async function createSession(opts: {
  maxAgeSec: number;
  ip?: string;
  userAgent?: string;
}): Promise<AdminSession> {
  const store = await readStore();
  const id = randomBytes(32).toString("hex");
  const now = Date.now();
  const session: AdminSession = {
    id,
    createdAt: now,
    expiresAt: now + opts.maxAgeSec * 1000,
    lastActivityAt: now,
    ipHash: hashMeta(opts.ip),
    uaHash: hashMeta(opts.userAgent),
  };
  store[id] = session;
  await writeStore(store);
  return session;
}

export async function getSession(id: string): Promise<AdminSession | null> {
  const store = await readStore();
  return store[id] ?? null;
}

export async function touchSession(id: string): Promise<void> {
  const store = await readStore();
  const session = store[id];
  if (!session) return;
  session.lastActivityAt = Date.now();
  store[id] = session;
  await writeStore(store);
}

export async function deleteSession(id: string): Promise<void> {
  const store = await readStore();
  if (!store[id]) return;
  delete store[id];
  await writeStore(store);
}

export async function revokeAllSessions(): Promise<void> {
  await writeStore({});
}
