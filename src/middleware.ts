import { NextResponse } from "next/server";

/**
 * Preview / development must never be indexed (SEC-08).
 * VERCEL_ENV is "production" only on the production deployment.
 */
function isIndexableDeployment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) return vercelEnv === "production";
  return process.env.NODE_ENV === "production";
}

export function middleware() {
  const res = NextResponse.next();

  if (!isIndexableDeployment()) {
    res.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Pages HTML only. API multipart (upload) and media streams must not
     * pass through middleware — Next.js buffers the body and the default
     * limit rejects photos, which looks like a CMS-wide "Erreur serveur".
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
