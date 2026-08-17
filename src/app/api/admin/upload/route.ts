import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  assertSameOrigin,
  genericServerError,
  getClientIp,
} from "@/lib/admin-request";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import {
  normalizeUploadedImage,
  uploadNormalizedImage,
} from "@/lib/upload-image";
import { logSecurityEvent } from "@/lib/security-log";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo
const CLAIMED_ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  pruneRateLimits();
  const ip = getClientIp(req);
  const limited = await rateLimit(`admin-upload:${ip}`, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop d'uploads. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 8 Mo)" },
      { status: 400 },
    );
  }

  if (file.type && !CLAIMED_ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WebP)" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const normalized = await normalizeUploadedImage(buffer);
    const result = await uploadNormalizedImage(normalized);
    logSecurityEvent("admin.upload", {
      mime: normalized.mime,
      width: normalized.width,
      height: normalized.height,
      bytes: normalized.buffer.length,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && /image|GIF|volumineux|dimensions|illisible|frames/i.test(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return genericServerError("[admin/upload]", err);
  }
}
