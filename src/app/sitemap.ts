import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content-store";
import { publishedBoats } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/bateaux`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  if (content.pages.location.published) {
    staticPages.push({
      url: `${SITE_URL}/location-bateau-cassis`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  if (content.pages.calanques.published) {
    staticPages.push({
      url: `${SITE_URL}/calanques-de-cassis`,
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  const boatPages: MetadataRoute.Sitemap = publishedBoats(content.boats).map(
    (boat) => ({
      url: `${SITE_URL}/bateaux/${boat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [...staticPages, ...boatPages];
}
