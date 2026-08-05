/** Canonical public site URL — used by metadata, sitemap, robots, JSON-LD */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.jcfboat.fr";

export const SITE_NAME = "JCF Boat";
export const SITE_LOCALE = "fr_FR";
