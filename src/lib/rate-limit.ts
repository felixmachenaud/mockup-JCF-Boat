import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

type LimitResult = { ok: true } | { ok: false; retryAfterSec: number };

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  let limiter = upstashLimiters.get(key);
  if (!limiter) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "jcf-rl",
      analytics: false,
    });
    upstashLimiters.set(key, limiter);
  }
  return limiter;
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): LimitResult {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || now >= current.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

/**
 * Shared rate limiting is mandatory in production. Falling back to an
 * in-process Map on a serverless deployment would silently remove protection.
 */
export async function rateLimit(
  key: string,
  {
    limit,
    windowMs,
  }: {
    limit: number;
    windowMs: number;
  },
): Promise<LimitResult> {
  if (upstashConfigured()) {
    try {
      const result = await getUpstashLimiter(limit, windowMs).limit(key);
      if (result.success) return { ok: true };
      const retryAfterSec = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      );
      return { ok: false, retryAfterSec };
    } catch (err) {
      console.error(
        "[rate-limit] upstash failed",
        err instanceof Error ? err.message : "unknown",
      );
      if (isProduction()) return { ok: false, retryAfterSec: 60 };
    }
  }

  if (isProduction()) {
    console.error("[rate-limit] Upstash is not configured in production");
    return { ok: false, retryAfterSec: 60 };
  }

  return memoryRateLimit(key, limit, windowMs);
}

/** Nettoyage opportuniste du store mémoire (dev / fallback). */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, bucket] of memoryBuckets) {
    if (now >= bucket.resetAt) memoryBuckets.delete(key);
  }
}

export function isSharedRateLimitConfigured(): boolean {
  return upstashConfigured();
}
