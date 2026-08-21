import { env } from "node:process";

/**
 * Read a server secret at runtime.
 * Dynamic lookup (env[name]) avoids Next.js inlining process.env.FOO at
 * build time, which would freeze empty Upstash values forever.
 */
export function readServerEnv(name: string): string {
  const value = env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getUpstashRedisConfig(): { url: string; token: string } | null {
  const url =
    readServerEnv("UPSTASH_REDIS_REST_URL") || readServerEnv("KV_REST_API_URL");
  const token =
    readServerEnv("UPSTASH_REDIS_REST_TOKEN") ||
    readServerEnv("KV_REST_API_TOKEN");
  if (!url || !token) return null;
  return { url, token };
}
