import { afterEach, describe, expect, it, vi } from "vitest";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";

function stubNoRedis() {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  pruneRateLimits();
});

describe("rateLimit (mémoire, hors production)", () => {
  it("laisse passer jusqu'à la limite puis bloque", async () => {
    vi.stubEnv("NODE_ENV", "test");
    stubNoRedis();
    const key = `unit-${Math.random().toString(16).slice(2)}`;

    for (let i = 0; i < 5; i++) {
      const result = await rateLimit(key, { limit: 5, windowMs: 60_000 });
      expect(result.ok).toBe(true);
    }

    const blocked = await rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("réouvre la fenêtre une fois expirée", async () => {
    vi.stubEnv("NODE_ENV", "test");
    stubNoRedis();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const key = `window-${Math.random().toString(16).slice(2)}`;
    for (let i = 0; i < 2; i++) {
      expect((await rateLimit(key, { limit: 2, windowMs: 1_000 })).ok).toBe(true);
    }
    expect((await rateLimit(key, { limit: 2, windowMs: 1_000 })).ok).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    expect((await rateLimit(key, { limit: 2, windowMs: 1_000 })).ok).toBe(true);
  });

  it("refuse en production si Redis n'est pas configuré", async () => {
    vi.stubEnv("NODE_ENV", "production");
    stubNoRedis();
    const result = await rateLimit("prod-key", { limit: 5, windowMs: 60_000 });
    expect(result.ok).toBe(false);
  });
});
