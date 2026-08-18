import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  assertContentLength,
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
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

function uploadFailureResponse(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : "";
  if (
    msg &&
    /image|GIF|volumineux|dimensions|illisible|frames|invalide/i.test(msg)
  ) {
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (/blob|token|credentials|store|access/i.test(msg)) {
    console.error("[admin/upload] blob", msg);
    return NextResponse.json(
      { error: "Stockage photos indisponible. Réessayez, ou vérifiez Vercel Blob." },
      { status: 503 },
    );
  }
  if (/sharp|libvips|dlopen/i.test(msg)) {
    console.error("[admin/upload] sharp", msg);
    return NextResponse.json(
      { error: "Traitement d'image indisponible sur le serveur." },
      { status: 503 },
    );
  }
  return genericServerError("[admin/upload]", err);
}

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const sizeError = assertContentLength(req, MAX_BYTES + 64 * 1024);
  if (sizeError) return sizeError;

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

  if (
    file.type &&
    !file.type.startsWith("image/") &&
    file.type !== "application/octet-stream"
  ) {
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
    return uploadFailureResponse(err);
  }
}
