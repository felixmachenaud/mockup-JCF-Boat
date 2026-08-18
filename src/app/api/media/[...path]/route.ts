import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isSafeUploadPathname } from "@/lib/upload-image";

export const runtime = "nodejs";

/**
 * Sert les photos admin stockées dans le Blob privé.
 * Uniquement le préfixe jcf-uploads/ (jamais le JSON CMS ni les sessions).
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const pathname = path.map((segment) => decodeURIComponent(segment)).join("/");

  if (!isSafeUploadPathname(pathname)) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/not.?found|404/i.test(msg)) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    console.error("[api/media]", msg || "unknown");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
