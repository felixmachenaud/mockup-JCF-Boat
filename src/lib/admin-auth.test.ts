import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  assertAuthSecretsReady,
  hashPassword,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/admin-auth";

const PASSWORD = "correct-horse-battery";
const AUTH_SECRET = "e2e-auth-secret-must-be-32-chars-min";

let hash: string;

beforeAll(() => {
  hash = hashPassword(PASSWORD);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("verifyPassword / hashPassword", () => {
  it("accepte le mot de passe correspondant au hash scrypt", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    expect(verifyPassword(PASSWORD)).toBe(true);
    expect(verifyPassword("mauvais-mot-de-passe")).toBe(false);
  });

  it("refuse une chaîne vide ou trop longue", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    expect(verifyPassword("")).toBe(false);
    expect(verifyPassword("x".repeat(201))).toBe(false);
  });

  it("en local, compare ADMIN_PASSWORD en clair si aucun hash n'est défini", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    vi.stubEnv("ADMIN_PASSWORD", "local-plain");
    vi.stubEnv("AUTH_SECRET", AUTH_SECRET);
    expect(verifyPassword("local-plain")).toBe(true);
    expect(verifyPassword("other")).toBe(false);
  });
});

describe("assertAuthSecretsReady", () => {
  it("autorise le mode développement sans secrets prod", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(assertAuthSecretsReady()).toEqual({ ok: true });
  });

  it("exige AUTH_SECRET (≥ 32) et ADMIN_PASSWORD_HASH en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    const missingSecret = assertAuthSecretsReady();
    expect(missingSecret.ok).toBe(false);
    if (!missingSecret.ok) {
      expect(missingSecret.error).toMatch(/AUTH_SECRET/);
    }

    vi.stubEnv("AUTH_SECRET", AUTH_SECRET);
    const missingHash = assertAuthSecretsReady();
    expect(missingHash.ok).toBe(false);
    if (!missingHash.ok) {
      expect(missingHash.error).toMatch(/ADMIN_PASSWORD_HASH/);
    }
  });

  it("exige Redis Upstash en production même si hash + secret sont là", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", AUTH_SECRET);
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    const ready = assertAuthSecretsReady();
    expect(ready.ok).toBe(false);
    if (!ready.ok) {
      expect(ready.error).toMatch(/Redis/i);
    }
  });

  it("est prêt en production avec hash, secret et Redis", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", AUTH_SECRET);
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "upstash-token");
    expect(assertAuthSecretsReady()).toEqual({ ok: true });
  });
});

describe("isAdminConfigured", () => {
  it("ignore ADMIN_PASSWORD en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "should-not-count");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(isAdminConfigured()).toBe(false);
  });

  it("accepte le hash en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    expect(isAdminConfigured()).toBe(true);
  });
});
