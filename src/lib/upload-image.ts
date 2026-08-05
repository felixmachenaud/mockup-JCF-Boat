import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

function blobConfigured() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

export type AllowedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

const EXT_BY_MIME: Record<AllowedImageMime, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * Détecte le type réel via magic bytes — ne jamais faire confiance au MIME navigateur.
 */
export function detectImageMime(buffer: Buffer): AllowedImageMime | null {
  if (buffer.length < 12) return null;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Upload image admin → URL publique.
 * Nom de fichier entièrement généré côté serveur (pas d'extension client).
 * Prod : Vercel Blob public. Dev sans Blob : public/uploads/
 */
export async function uploadPublicImage(
  file: File,
  mime: AllowedImageMime,
): Promise<{ url: string; pathname: string }> {
  const ext = EXT_BY_MIME[mime];
  const unique = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (blobConfigured()) {
    const blob = await put(`jcf-uploads/${unique}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: mime,
    });
    return { url: blob.url, pathname: blob.pathname };
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, unique);
  // Garde-fou path traversal (nom entièrement serveur, mais on vérifie quand même)
  if (!target.startsWith(dir + path.sep)) {
    throw new Error("Invalid upload path");
  }
  await fs.writeFile(target, buffer);
  return { url: `/uploads/${unique}`, pathname: `uploads/${unique}` };
}
