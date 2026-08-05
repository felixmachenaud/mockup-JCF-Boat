import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  assertSameOrigin,
  genericServerError,
  getClientIp,
} from "@/lib/admin-request";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { detectImageMime, uploadPublicImage } from "@/lib/upload-image";

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
  const limited = rateLimit(`admin-upload:${ip}`, {
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

  // Filtre rapide sur le MIME déclaré, puis vérification magic bytes.
  if (file.type && !CLAIMED_ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WebP, GIF)" },
      { status: 400 },
    );
  }

  const header = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const mime = detectImageMime(header);
  if (!mime) {
    return NextResponse.json(
      { error: "Contenu fichier invalide (image attendue)" },
      { status: 400 },
    );
  }

  try {
    const result = await uploadPublicImage(file, mime);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return genericServerError("[admin/upload]", err);
  }
}
