import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  assertContentLength,
  assertSameOrigin,
  genericServerError,
} from "@/lib/admin-request";
import { saveContent } from "@/lib/content-store";
import { parseSiteContent } from "@/lib/site-content-schema";

export const runtime = "nodejs";

const MAX_SAVE_BYTES = 2 * 1024 * 1024; // 2 Mo

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sizeError = assertContentLength(req, MAX_SAVE_BYTES);
  if (sizeError) return sizeError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = parseSiteContent(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await saveContent(parsed.data);
  } catch (err) {
    return genericServerError("[admin/save]", err);
  }

  revalidatePath("/");
  revalidatePath("/bateaux", "layout");
  revalidatePath("/location-bateau-cassis");
  revalidatePath("/calanques-de-cassis");
  revalidatePath("/sitemap.xml");
  for (const boat of parsed.data.boats) {
    if (boat.published) revalidatePath(`/bateaux/${boat.slug}`);
  }

  return NextResponse.json({ ok: true });
}
