import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/admin-request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
