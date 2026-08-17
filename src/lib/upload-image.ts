import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

function blobConfigured() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

export type AllowedImageMime = "image/jpeg" | "image/png" | "image/webp";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 4500;
const MAX_HEIGHT = 4500;
const MAX_PIXELS = 20_000_000;
const OUTPUT_MAX_EDGE = 2400;

/**
 * Détecte le type réel via magic bytes — ne jamais faire confiance au MIME navigateur.
 */
export function detectImageMime(
  buffer: Buffer,
): AllowedImageMime | "image/gif" | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
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

export type NormalizedImage = {
  buffer: Buffer;
  mime: "image/webp" | "image/jpeg";
  width: number;
  height: number;
  ext: ".webp" | ".jpg";
};

/**
 * Decode, dimension-limit, strip metadata and re-encode (SEC-05).
 * GIF/animation rejected. Malformed images rejected.
 */
export async function normalizeUploadedImage(
  input: Buffer,
): Promise<NormalizedImage> {
  if (input.length <= 0 || input.length > MAX_INPUT_BYTES) {
    throw new Error("Fichier trop volumineux (max 8 Mo)");
  }

  const magic = detectImageMime(input);
  if (!magic) {
    throw new Error("Contenu fichier invalide (image attendue)");
  }
  if (magic === "image/gif") {
    throw new Error(
      "Les GIF animés ne sont pas acceptés — utilisez JPEG, PNG ou WebP",
    );
  }

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, {
      failOn: "warning",
      animated: false,
      limitInputPixels: MAX_PIXELS,
    }).metadata();
  } catch {
    throw new Error("Image illisible ou corrompue");
  }

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) {
    throw new Error("Impossible de lire les dimensions de l'image");
  }
  if (width > MAX_WIDTH || height > MAX_HEIGHT || width * height > MAX_PIXELS) {
    throw new Error("Image trop grande (dimensions / pixels)");
  }
  if ((meta.pages ?? 1) > 1) {
    throw new Error("Les images multi-frames / animées ne sont pas acceptées");
  }

  const base = () =>
    sharp(input, {
      failOn: "warning",
      animated: false,
      limitInputPixels: MAX_PIXELS,
    })
      .rotate() // apply EXIF orientation, then metadata is dropped on encode
      .resize({
        width: OUTPUT_MAX_EDGE,
        height: OUTPUT_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });

  try {
    const webp = await base()
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: webp.data,
      mime: "image/webp",
      width: webp.info.width,
      height: webp.info.height,
      ext: ".webp",
    };
  } catch {
    const jpeg = await base()
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: jpeg.data,
      mime: "image/jpeg",
      width: jpeg.info.width,
      height: jpeg.info.height,
      ext: ".jpg",
    };
  }
}

/**
 * Upload image admin → URL publique (uniquement l'asset normalisé).
 */
export async function uploadNormalizedImage(
  normalized: NormalizedImage,
): Promise<{ url: string; pathname: string; width: number; height: number }> {
  const unique = `${Date.now()}-${randomBytes(8).toString("hex")}${normalized.ext}`;

  if (blobConfigured()) {
    const blob = await put(`jcf-uploads/${unique}`, normalized.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: normalized.mime,
    });
    return {
      url: blob.url,
      pathname: blob.pathname,
      width: normalized.width,
      height: normalized.height,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Upload requires Vercel Blob in production");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, unique);
  if (!target.startsWith(dir + path.sep)) {
    throw new Error("Invalid upload path");
  }
  await fs.writeFile(target, normalized.buffer);
  return {
    url: `/uploads/${unique}`,
    pathname: `uploads/${unique}`,
    width: normalized.width,
    height: normalized.height,
  };
}
