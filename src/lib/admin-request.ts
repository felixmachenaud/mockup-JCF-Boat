import { NextResponse } from "next/server";
import { readServerEnv } from "@/lib/server-env";

const ADMIN_API_PREFIX = "/api/admin";

/**
 * CSRF défense en profondeur pour les mutations cookie-auth.
 * SameSite=Lax bloque déjà la plupart des POST cross-site ; Origin/Referer
 * couvrent les navigateurs plus permissifs et les outils malveillants.
 */
export function assertSameOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!host) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const allowed = new Set<string>([`https://${host}`, `http://${host}`]);
  const siteUrl = readServerEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  if (siteUrl) allowed.add(siteUrl);

  if (origin) {
    if (!allowed.has(origin)) {
      return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
    }
    return null;
  }

  // Certains clients ommettent Origin ; Referer reste un signal utile.
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!allowed.has(refOrigin)) {
        return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
      }
      return null;
    } catch {
      return NextResponse.json({ error: "Referer invalide" }, { status: 403 });
    }
  }

  // Pas d'Origin ni Referer : refuser les mutations sensibles (fail closed).
  return NextResponse.json({ error: "Origine manquante" }, { status: 403 });
}

export function getClientIp(req: Request): string {
  // Sur Vercel, x-forwarded-for est fourni par la plateforme (proxy de confiance).
  // En self-hosting, ne pas faire confiance à ces en-têtes sans reverse-proxy contrôlé.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

export function assertContentLength(
  req: Request,
  maxBytes: number,
): NextResponse | null {
  const raw = req.headers.get("content-length");
  if (!raw) return null;
  const length = Number(raw);
  if (!Number.isFinite(length) || length < 0) {
    return NextResponse.json({ error: "Content-Length invalide" }, { status: 400 });
  }
  if (length > maxBytes) {
    return NextResponse.json({ error: "Payload trop volumineux" }, { status: 413 });
  }
  return null;
}

export function genericServerError(logLabel: string, err: unknown): NextResponse {
  console.error(logLabel, err instanceof Error ? err.message : "unknown");
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

export { ADMIN_API_PREFIX };
