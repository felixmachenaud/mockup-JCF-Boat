import type { Metadata } from "next";
import { getContent } from "@/lib/content-store";
import { SITE_URL } from "@/lib/site-config";
import { HomePage } from "@/components/home-page";
import { JsonLd } from "@/components/json-ld";

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
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function Page() {
  const content = await getContent();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BoatRental",
          name: content.brand.name,
          description: content.seo.homeDescription,
          url: SITE_URL,
          telephone: content.contact.phoneDisplay,
          email: content.contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Port de Cassis",
            addressLocality: "Cassis",
            postalCode: "13260",
            addressCountry: "FR",
          },
          areaServed: {
            "@type": "Place",
            name: "Cassis et calanques",
          },
        }}
      />
      <HomePage content={content} />
    </>
  );
}
