import type { Metadata } from "next";
import { getContent } from "@/lib/content-store";
import { publishedBoats } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";
import { PageBackground } from "@/components/page-background";
import { RestOfPageBlur } from "@/components/rest-of-page-blur";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { JsonLd } from "@/components/json-ld";
import { BoatCard } from "@/components/boat-card";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.boatsTitle,
    description: c.seo.boatsDescription,
    alternates: { canonical: "/bateaux" },
    openGraph: {
      title: `${c.seo.boatsTitle} | ${c.brand.name}`,
      description: c.seo.boatsDescription,
      url: `${SITE_URL}/bateaux`,
      images: [{ url: "/mana23.1.jpg" }],
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function BateauxPage() {
  const content = await getContent();
  const boats = publishedBoats(content.boats);

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: content.seo.boatsTitle,
          itemListElement: boats.map((boat, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/bateaux/${boat.slug}`,
            name: boat.name,
          })),
        }}
      />
      <PageBackground />
      <RestOfPageBlur />
      <SiteHeader
        brandName={content.brand.name}
        phone={content.contact.phone}
        phoneDisplay={content.contact.phoneDisplay}
      />

      <div className="relative z-[2]">
        <section
          id="flotte"
          className="px-4 pb-20 pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-8 md:pb-28 md:pt-28"
        >
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 text-center md:mb-10 md:text-left">
              <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
                {content.fleet.eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
                {content.seo.boatsTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                {content.seo.boatsDescription}
              </p>
            </header>

            {boats.length === 0 ? (
              <p className="text-white/60">Aucun bateau publié pour le moment.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {boats.map((boat) => (
                  <BoatCard key={boat.id} boat={boat} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <MobileNav />
    </main>
  );
}
