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
     * Apply to all routes except Next internals and static file fingerprints.
     * Still covers HTML pages, sitemap, robots, and API responses.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
