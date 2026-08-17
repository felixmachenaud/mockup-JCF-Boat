import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createSession,
  deleteSession,
  getSession,
  revokeAllSessions,
  touchSession,
  type AdminSession,
} from "@/lib/admin-sessions";
import { logSecurityEvent } from "@/lib/security-log";

const COOKIE_NAME = "jcf_admin";
/** Absolute session lifetime */
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 heures
/** Idle timeout — sliding on activity */
const IDLE_MS = 60 * 60 * 2 * 1000; // 2 heures

/** Mot de passe de démo UNIQUEMENT en développement local. */
const DEMO_PASSWORD = "jcf-admin";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * AUTH_SECRET is mandatory in production and must never be the password.
 * Min 32 characters recommended.
 */
export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (isProduction()) return null;
  // Dev only fallback — never used when AUTH_SECRET is set
  return process.env.AUTH_SECRET?.trim() || `dev-only-${DEMO_PASSWORD}-not-for-prod!!`;
}

function getPlainPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction()) return null;
  // Demo password only when neither hash nor password is configured
  if (!process.env.ADMIN_PASSWORD_HASH?.trim()) return DEMO_PASSWORD;
  return null;
}

function getPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

/** Encode a password with scrypt for ADMIN_PASSWORD_HASH. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString(
    "hex",
  );
  return `scrypt$16384$8$1$${salt}$${hash}`;
}

function verifyScryptHash(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = parts[4];
  const expectedHex = parts[5];
  if (!salt || !expectedHex || !Number.isFinite(N)) return false;
  try {
    const actual = scryptSync(password, salt, expectedHex.length / 2, {
      N,
      r,
      p,
    });
    const expected = Buffer.from(expectedHex, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function safePasswordEq(submitted: string, expected: string, secret: string): boolean {
  const a = createHmac("sha256", secret).update(`pwd:${submitted}`).digest();
  const b = createHmac("sha256", secret).update(`pwd:${expected}`).digest();
  return timingSafeEqual(a, b);
}

export type AdminAuthStatus =
  | { ok: true; session: AdminSession }
  | {
      ok: false;
      reason:
        | "no_cookie"
        | "bad_signature"
        | "expired"
        | "idle"
        | "unconfigured"
        | "revoked";
    };

export function isAdminConfigured(): boolean {
  return Boolean(getPasswordHash() || process.env.ADMIN_PASSWORD?.trim());
}

export function isUsingDemoAuth(): boolean {
  return (
    !isProduction() &&
    !getPasswordHash() &&
    !process.env.ADMIN_PASSWORD?.trim()
  );
}

export function assertAuthSecretsReady(): { ok: true } | { ok: false; error: string } {
  if (!isProduction()) return { ok: true };
  const secret = getAuthSecret();
  if (!secret) {
    return {
      ok: false,
      error:
        "AUTH_SECRET manquant ou trop court (min. 32 caractères). Ne réutilisez pas le mot de passe.",
    };
  }
  if (!getPasswordHash() && !process.env.ADMIN_PASSWORD?.trim()) {
    return {
      ok: false,
      error: "ADMIN_PASSWORD_HASH (ou ADMIN_PASSWORD temporaire) requis en production.",
    };
  }
  return { ok: true };
}

export async function checkAdminAuth(): Promise<AdminAuthStatus> {
  const secrets = assertAuthSecretsReady();
  if (!secrets.ok && isProduction()) {
    return { ok: false, reason: "unconfigured" };
  }

  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (!sessionId || !/^[a-f0-9]{48,128}$/i.test(sessionId)) {
    return { ok: false, reason: "no_cookie" };
  }

  const session = await getSession(sessionId);
  if (!session) return { ok: false, reason: "revoked" };

  const now = Date.now();
  if (now > session.expiresAt) return { ok: false, reason: "expired" };
  if (now - session.lastActivityAt > IDLE_MS) return { ok: false, reason: "idle" };

  await touchSession(sessionId);
  return { ok: true, session };
}

export async function isAdminAuthed(): Promise<boolean> {
  const status = await checkAdminAuth();
  return status.ok;
}

export async function setAdminCookie(meta?: {
  ip?: string;
  userAgent?: string;
}): Promise<string> {
  const secrets = assertAuthSecretsReady();
  if (!secrets.ok) {
    throw new Error(secrets.error);
  }
  if (!getAuthSecret()) {
    throw new Error("Admin auth not configured");
  }

  const session = await createSession({
    maxAgeSec: COOKIE_MAX_AGE,
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return session.id;
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  logSecurityEvent("admin.logout");
}

export async function logoutAllSessions(): Promise<void> {
  await revokeAllSessions();
  await clearAdminCookie();
}

export function verifyPassword(submitted: string): boolean {
  if (typeof submitted !== "string" || submitted.length === 0 || submitted.length > 200) {
    return false;
  }

  const hash = getPasswordHash();
  if (hash) {
    return verifyScryptHash(submitted, hash);
  }

  const expected = getPlainPassword();
  const secret = getAuthSecret();
  if (!expected || !secret) return false;
  return safePasswordEq(submitted, expected, secret);
}
