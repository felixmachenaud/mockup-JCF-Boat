import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const UPLOAD_PREFIX = "jcf-uploads";
export const MEDIA_PROXY_PREFIX = "/api/media";

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
  mime: "image/webp" | "image/jpeg" | "image/png";
  width: number;
  height: number;
  ext: ".webp" | ".jpg" | ".png";
};

function isSharpModuleError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /Could not load the ["']?sharp["']? module|libvips|ERR_DLOPEN|Cannot find module ['"]sharp|sharp\.node/i.test(
    msg,
  );
}

function passthroughNormalized(
  input: Buffer,
  magic: AllowedImageMime,
): NormalizedImage {
  if (magic === "image/png") {
    return { buffer: input, mime: "image/png", width: 0, height: 0, ext: ".png" };
  }
  if (magic === "image/webp") {
    return {
      buffer: input,
      mime: "image/webp",
      width: 0,
      height: 0,
      ext: ".webp",
    };
  }
  return { buffer: input, mime: "image/jpeg", width: 0, height: 0, ext: ".jpg" };
}

async function normalizeWithSharp(
  input: Buffer,
): Promise<NormalizedImage> {
  const sharp = (await import("sharp")).default;
  const options = {
    failOn: "error" as const,
    animated: false,
    limitInputPixels: MAX_PIXELS,
  };

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, options).metadata();
  } catch (err) {
    if (isSharpModuleError(err)) throw err;
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
    sharp(input, options)
      .rotate()
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
 * Decode, dimension-limit, strip metadata and re-encode (SEC-05).
 * If Sharp is unavailable on the host, fall back to the already-validated bytes
 * (the admin UI also re-encodes in the browser).
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

  try {
    return await normalizeWithSharp(input);
  } catch (err) {
    if (
      err instanceof Error &&
      /illisible|dimensions|trop grande|multi-frames|animées/i.test(err.message)
    ) {
      throw err;
    }
    console.error(
      "[upload-image] sharp unavailable, passthrough",
      err instanceof Error ? err.message : "unknown",
    );
    return passthroughNormalized(input, magic);
  }
}

function mediaProxyUrl(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "");
  return `${MEDIA_PROXY_PREFIX}/${clean}`;
}

async function putToBlobStore(
  objectPath: string,
  buffer: Buffer,
  mime: NormalizedImage["mime"],
): Promise<{ url: string; pathname: string }> {
  const common = {
    addRandomSuffix: false as const,
    contentType: mime,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  };

  const attempts: Array<"private" | "public"> = ["private", "public"];
  let lastError: unknown;

  for (const access of attempts) {
    try {
      // Fresh copy: some put() implementations consume the body.
      const body = new Blob([new Uint8Array(buffer)], { type: mime });
      const blob = await put(objectPath, body, { ...common, access });
      return {
        url: access === "private" ? mediaProxyUrl(blob.pathname) : blob.url,
        pathname: blob.pathname,
      };
    } catch (err) {
      lastError = err;
      console.error(
        `[upload-image] blob put access=${access} failed`,
        err instanceof Error ? err.message : "unknown",
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Upload vers le stockage impossible");
}

/**
 * Upload image admin → URL affichable sur le site.
 * Store Blob privé (comme le CMS) + proxy /api/media ; fallback public.
 */
export async function uploadNormalizedImage(
  normalized: NormalizedImage,
): Promise<{ url: string; pathname: string; width: number; height: number }> {
  const unique = `${Date.now()}-${randomBytes(8).toString("hex")}${normalized.ext}`;
  const objectPath = `${UPLOAD_PREFIX}/${unique}`;

  if (blobConfigured()) {
    const stored = await putToBlobStore(
      objectPath,
      normalized.buffer,
      normalized.mime,
    );
    return {
      url: stored.url,
      pathname: stored.pathname,
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

export function isSafeUploadPathname(pathname: string): boolean {
  return new RegExp(
    `^${UPLOAD_PREFIX}/[0-9]+-[a-f0-9]+\\.(webp|jpg|jpeg|png)$`,
    "i",
  ).test(pathname);
}
