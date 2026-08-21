/**
 * Read a server secret from the real Node process at request time.
 *
 * Do not import { env } from "node:process" and do not write
 * process.env.UPSTASH_REDIS_REST_URL: Next.js can polyfill / inline those
 * to empty strings at build, which is what blocked /admin after Vercel
 * secrets were filled in.
 */
function runtimeProcessEnv(): Record<string, string | undefined> {
  const proc = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process;
  return proc?.env ?? {};
}

export function readServerEnv(name: string): string {
  const value = runtimeProcessEnv()[name];
  return typeof value === "string" ? value.trim() : "";
}

function redisRestKey(part: "URL" | "TOKEN"): string {
  return `UPSTASH_REDIS_REST_${part}`;
}

export function getUpstashRedisPresence(): { url: boolean; token: boolean } {
  const env = runtimeProcessEnv();
  return {
    url: Boolean(
      String(env[redisRestKey("URL")] || env.KV_REST_API_URL || "").trim(),
    ),
    token: Boolean(
      String(env[redisRestKey("TOKEN")] || env.KV_REST_API_TOKEN || "").trim(),
    ),
  };
}

export function getUpstashRedisConfig(): { url: string; token: string } | null {
  const env = runtimeProcessEnv();
  const url = String(env[redisRestKey("URL")] || env.KV_REST_API_URL || "").trim();
  const token = String(
    env[redisRestKey("TOKEN")] || env.KV_REST_API_TOKEN || "",
  ).trim();
  if (!url || !token) return null;
  return { url, token };
}
