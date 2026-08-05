import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "jcf_admin";
/** Session admin courte : réduit la fenêtre d'abus si le cookie fuit. */
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 heures

/** Mot de passe de démo UNIQUEMENT en développement local. */
const DEMO_PASSWORD = "jcf-admin";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getConfiguredPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction()) return null;
  return DEMO_PASSWORD;
}

function getSecret(): string | null {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction()) return null;
  return DEMO_PASSWORD;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEq(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/** Compare sans fuite de longueur : HMAC des deux côtés, digests de taille fixe. */
function safePasswordEq(submitted: string, expected: string, secret: string): boolean {
  const a = createHmac("sha256", secret).update(`pwd:${submitted}`).digest();
  const b = createHmac("sha256", secret).update(`pwd:${expected}`).digest();
  return timingSafeEqual(a, b);
}

export type AdminAuthStatus =
  | { ok: true }
  | {
      ok: false;
      reason: "no_cookie" | "bad_signature" | "expired" | "unconfigured";
    };

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function isUsingDemoAuth(): boolean {
  return !isProduction() && !isAdminConfigured();
}

export async function checkAdminAuth(): Promise<AdminAuthStatus> {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: "unconfigured" };

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return { ok: false, reason: "no_cookie" };

  const [issuedAt, signature] = raw.split(".");
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) {
    return { ok: false, reason: "bad_signature" };
  }

  const expected = sign(issuedAt, secret);
  if (!safeEq(signature, expected)) return { ok: false, reason: "bad_signature" };

  const age = Date.now() - Number(issuedAt);
  if (Number.isNaN(age) || age < 0 || age > COOKIE_MAX_AGE * 1000) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

export async function isAdminAuthed(): Promise<boolean> {
  const status = await checkAdminAuth();
  return status.ok;
}

export async function setAdminCookie(): Promise<void> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("Admin auth not configured");
  }
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt, secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, `${issuedAt}.${signature}`, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function verifyPassword(submitted: string): boolean {
  if (typeof submitted !== "string" || submitted.length === 0 || submitted.length > 200) {
    return false;
  }
  const expected = getConfiguredPassword();
  const secret = getSecret();
  if (!expected || !secret) return false;
  return safePasswordEq(submitted, expected, secret);
}
