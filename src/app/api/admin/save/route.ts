import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  assertContentLength,
  assertSameOrigin,
  genericServerError,
} from "@/lib/admin-request";
import {
  ContentConflictError,
  getContentStoreMode,
  saveContent,
} from "@/lib/content-store";
import { parseSiteContent } from "@/lib/site-content-schema";
import { logSecurityEvent } from "@/lib/security-log";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_SAVE_BYTES = 2 * 1024 * 1024; // 2 Mo

const saveBodySchema = z.object({
  expectedVersion: z.number().int().min(0),
  content: z.unknown(),
});

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const auth = await checkAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (getContentStoreMode() === "unconfigured") {
    return NextResponse.json(
      { error: "Stockage Blob non configuré — écriture CMS refusée." },
      { status: 503 },
    );
  }

  const sizeError = assertContentLength(req, MAX_SAVE_BYTES);
  if (sizeError) return sizeError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Backward compatible: either { expectedVersion, content } or raw SiteContent
  let expectedVersion = 0;
  let contentRaw: unknown = body;
  const wrapped = saveBodySchema.safeParse(body);
  if (wrapped.success) {
    expectedVersion = wrapped.data.expectedVersion;
    contentRaw = wrapped.data.content;
  } else if (
    body &&
    typeof body === "object" &&
    "expectedVersion" in body &&
    "content" in body
  ) {
    return NextResponse.json({ error: "Corps de sauvegarde invalide" }, { status: 400 });
  }

  const parsed = parseSiteContent(contentRaw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const meta = await saveContent(parsed.data, {
      expectedVersion,
      updatedBy: "admin",
    });

    revalidatePath("/");
    revalidatePath("/bateaux", "layout");
    revalidatePath("/location-bateau-cassis");
    revalidatePath("/calanques-de-cassis");
    revalidatePath("/sitemap.xml");
    for (const boat of parsed.data.boats) {
      if (boat.slug) revalidatePath(`/bateaux/${boat.slug}`);
    }

    logSecurityEvent("admin.save", {
      version: meta.version,
      boats: parsed.data.boats.length,
    });

    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    if (err instanceof ContentConflictError) {
      return NextResponse.json(
        {
          error:
            "Conflit : le contenu a été modifié ailleurs. Rechargez la page puis réessayez.",
          currentVersion: err.currentVersion,
          updatedAt: err.updatedAt,
        },
        { status: 409 },
      );
    }
    return genericServerError("[admin/save]", err);
  }
}
