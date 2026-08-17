import type { MetadataRoute } from "next";
import { getContentDocument } from "@/lib/content-store";
import { publishedBoats } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const doc = await getContentDocument();
  const content = doc.content;
  const lastModified = new Date(doc.meta.updatedAt);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/bateaux`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/politique-de-confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/conditions-de-location`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  if (content.pages.location.published) {
    staticPages.push({
      url: `${SITE_URL}/location-bateau-cassis`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  if (content.pages.calanques.published) {
    staticPages.push({
      url: `${SITE_URL}/calanques-de-cassis`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  const boatPages: MetadataRoute.Sitemap = publishedBoats(content.boats).map(
    (boat) => ({
      url: `${SITE_URL}/bateaux/${boat.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [...staticPages, ...boatPages];
}
