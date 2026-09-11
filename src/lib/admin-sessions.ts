import { createHash, createHmac, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import {
  getDataDir,
  getUpstashRedisConfig,
  getUpstashRedisPresence,
  readServerEnv,
} from "@/lib/server-env";

/** The browser receives the raw token; only a keyed digest is persisted. */
export type AdminSession = {
  createdAt: number;
  expiresAt: number;
  epoch: number;
  ipHash?: string;
  uaHash?: string;
};

type LocalSessionStore = {
  epoch: number;
  sessions: Record<string, AdminSession>;
};

const SESSION_PREFIX = "jcf-admin-session";
const SESSION_EPOCH_KEY = `${SESSION_PREFIX}:epoch`;

function localSessionPath() {
  return path.join(getDataDir(), "admin-sessions.json");
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function redisConfigured(): boolean {
  return Boolean(getUpstashRedisConfig());
}

function getRedis(): Redis {
  const config = getUpstashRedisConfig();
  if (!config) {
    throw new Error("Upstash Redis is not configured");
  }
  return new Redis(config);
}

function tokenDigest(token: string): string {
  // AUTH_SECRET also acts as a server-side pepper. Rotating it invalidates
  // every existing session key without ever storing the raw browser token.
  const secret = readServerEnv("AUTH_SECRET");
  if (secret) return createHmac("sha256", secret).update(token).digest("hex");
  return createHash("sha256").update(token).digest("hex");
}

function sessionKey(token: string): string {
  return `${SESSION_PREFIX}:${tokenDigest(token)}`;
}

function hashMeta(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function isSessionStoreConfigured(): boolean {
  return redisConfigured();
}

export function assertSessionStoreReady(): { ok: true } | { ok: false; error: string } {
  if (!isProduction() || redisConfigured()) return { ok: true };
  const presence = getUpstashRedisPresence();
  return {
    ok: false,
    error: `Redis est introuvable au runtime (URL ${presence.url ? "présente" : "absente"}, TOKEN ${presence.token ? "présent" : "absent"}). Ouvrez chaque variable Upstash dans Vercel, collez une valeur non vide, sauvegardez, puis Redeploy sans cache.`,
  };
}

async function readLocalStore(): Promise<LocalSessionStore> {
  try {
    const raw = await fs.readFile(localSessionPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalSessionStore>;
    return {
      epoch: Number(parsed.epoch) || 1,
      sessions: parsed.sessions || {},
    };
  } catch {
    return { epoch: 1, sessions: {} };
  }
}

async function writeLocalStore(store: LocalSessionStore): Promise<void> {
  const file = localSessionPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store), "utf8");
}

async function currentEpoch(redis: Redis): Promise<number> {
  const existing = await redis.get<number>(SESSION_EPOCH_KEY);
  if (typeof existing === "number" && Number.isFinite(existing) && existing > 0) {
    return existing;
  }
  await redis.set(SESSION_EPOCH_KEY, 1, { nx: true });
  return (await redis.get<number>(SESSION_EPOCH_KEY)) || 1;
}

export async function createSession(opts: {
  maxAgeSec: number;
  ip?: string;
  userAgent?: string;
}): Promise<{ token: string; session: AdminSession }> {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();

  if (redisConfigured()) {
    const redis = getRedis();
    const epoch = await currentEpoch(redis);
    const session: AdminSession = {
      createdAt: now,
      expiresAt: now + opts.maxAgeSec * 1000,
      epoch,
      ipHash: hashMeta(opts.ip),
      uaHash: hashMeta(opts.userAgent),
    };
    await redis.set(sessionKey(token), session, { ex: opts.maxAgeSec });
    return { token, session };
  }

  if (isProduction()) {
    throw new Error("Session store requires Upstash Redis in production.");
  }

  const store = await readLocalStore();
  const session: AdminSession = {
    createdAt: now,
    expiresAt: now + opts.maxAgeSec * 1000,
    epoch: store.epoch,
    ipHash: hashMeta(opts.ip),
    uaHash: hashMeta(opts.userAgent),
  };
  store.sessions[tokenDigest(token)] = session;
  await writeLocalStore(store);
  return { token, session };
}

export async function getSession(token: string): Promise<AdminSession | null> {
  if (redisConfigured()) {
    const redis = getRedis();
    const session = await redis.get<AdminSession>(sessionKey(token));
    if (!session) return null;
    const epoch = await currentEpoch(redis);
    return session.epoch === epoch ? session : null;
  }

  if (isProduction()) return null;
  const store = await readLocalStore();
  const session = store.sessions[tokenDigest(token)];
  if (!session || session.epoch !== store.epoch) return null;
  return session;
}

export async function deleteSession(token: string): Promise<void> {
  if (redisConfigured()) {
    await getRedis().del(sessionKey(token));
    return;
  }
  if (isProduction()) return;
  const store = await readLocalStore();
  delete store.sessions[tokenDigest(token)];
  await writeLocalStore(store);
}

/** Incrementing the epoch invalidates every session without rewriting them. */
export async function revokeAllSessions(): Promise<void> {
  if (redisConfigured()) {
    await getRedis().incr(SESSION_EPOCH_KEY);
    return;
  }
  if (isProduction()) return;
  const store = await readLocalStore();
  store.epoch += 1;
  store.sessions = {};
  await writeLocalStore(store);
}

export function isSessionExpired(session: AdminSession): boolean {
  return Date.now() >= session.expiresAt;
}
