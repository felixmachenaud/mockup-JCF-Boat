import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createSession,
  deleteSession,
  getSession,
  revokeAllSessions,
  type AdminSession,
  assertSessionStoreReady,
  isSessionExpired,
} from "@/lib/admin-sessions";
import { logSecurityEvent } from "@/lib/security-log";
import { readServerEnv } from "@/lib/server-env";

const COOKIE_NAME = "jcf_admin";
/** Absolute session lifetime */
const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 heures

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
  const secret = readServerEnv("AUTH_SECRET");
  if (secret && secret.length >= 32) return secret;
  if (isProduction()) return null;
  // Dev only fallback — never used when AUTH_SECRET is set
  return secret || `dev-only-${DEMO_PASSWORD}-not-for-prod!!`;
}

function getPlainPassword(): string | null {
  if (isProduction()) return null;
  const fromEnv = readServerEnv("ADMIN_PASSWORD");
  if (fromEnv) return fromEnv;
  // Demo password only when neither hash nor password is configured
  if (!readServerEnv("ADMIN_PASSWORD_HASH")) return DEMO_PASSWORD;
  return null;
}

function getPasswordHash(): string | null {
  return readServerEnv("ADMIN_PASSWORD_HASH") || null;
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
        | "unconfigured"
        | "revoked";
    };

export function isAdminConfigured(): boolean {
  return isProduction()
    ? Boolean(getPasswordHash())
    : Boolean(getPasswordHash() || readServerEnv("ADMIN_PASSWORD"));
}

export function isUsingDemoAuth(): boolean {
  return (
    !isProduction() &&
    !getPasswordHash() &&
    !readServerEnv("ADMIN_PASSWORD")
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
  if (!getPasswordHash()) {
    return {
      ok: false,
      error: "ADMIN_PASSWORD_HASH est requis en production. ADMIN_PASSWORD n'est accepté qu'en développement local.",
    };
  }
  const sessionStore = assertSessionStoreReady();
  if (!sessionStore.ok) return sessionStore;
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

  let session: AdminSession | null;
  try {
    session = await getSession(sessionId);
  } catch (err) {
    // An unavailable session store must deny access rather than turn into a
    // server error that could mask a security configuration problem.
    logSecurityEvent("admin.session_store_unavailable", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, reason: "unconfigured" };
  }
  if (!session) return { ok: false, reason: "revoked" };

  const now = Date.now();
  if (now > session.expiresAt || isSessionExpired(session)) {
    await deleteSession(sessionId);
    return { ok: false, reason: "expired" };
  }
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

  const { token } = await createSession({
    maxAgeSec: COOKIE_MAX_AGE,
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return token;
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
