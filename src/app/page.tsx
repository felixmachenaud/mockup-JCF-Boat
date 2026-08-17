import type { Metadata } from "next";
import { getContent } from "@/lib/content-store";
import { SITE_URL } from "@/lib/site-config";
import { HomePage } from "@/components/home-page";
import { JsonLd } from "@/components/json-ld";
import { buildOrganizationGraph } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.homeTitle,
    description: c.seo.homeDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: `${c.seo.homeTitle} | ${c.brand.name}`,
      description: c.seo.homeDescription,
      url: SITE_URL,
      siteName: c.brand.name,
      images: [{ url: "/mana23.1.jpg" }],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      images: ["/mana23.1.jpg"],
    },
  };
}

export default async function Page() {
  const content = await getContent();

  return (
    <>
      <JsonLd data={buildOrganizationGraph(content)} />
      <HomePage content={content} />
    </>
  );
}
