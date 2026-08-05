import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAdminConfigured,
  setAdminCookie,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  assertContentLength,
  assertSameOrigin,
  getClientIp,
} from "@/lib/admin-request";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginSchema = z
  .object({
    password: z.string().min(1).max(200),
  })
  .strict();

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const sizeError = assertContentLength(req, 4_096);
  if (sizeError) return sizeError;

  if (!isAdminConfigured() && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Administration non configurée" },
      { status: 503 },
    );
  }

  pruneRateLimits();
  const ip = getClientIp(req);
  const limited = rateLimit(`admin-login:${ip}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let password = "";
  try {
    const json: unknown = await req.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }
    password = parsed.data.password;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    // Message générique : pas d'énumération / pas d'aide à l'attaquant
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  try {
    await setAdminCookie();
  } catch {
    return NextResponse.json(
      { error: "Administration non configurée" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
