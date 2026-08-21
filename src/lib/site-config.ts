/** Canonical public site URL — used by metadata, sitemap, robots, JSON-LD */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.jcfboat.fr";

export const SITE_NAME = "JCF Boat";
export const SITE_LOCALE = "fr_FR";

/**
 * Host for Open Graph images. Preview deploys must use their own Vercel
 * origin — iMessage fetches og:image from that URL, not from the canonical
 * domain (which may not be live yet).
 */
export function getMetadataBaseUrl(): URL {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, "");
    if (vercelHost) return new URL(`https://${vercelHost}`);
  }
  return new URL(SITE_URL);
}

/** Image shown when the site is shared in Messages / WhatsApp / iMessage. */
export const SHARE_IMAGE = {
  url: "/mana23.1.jpg",
  width: 1200,
  height: 630,
  alt: "Location de bateaux à Cassis — JCF Boat",
} as const;
