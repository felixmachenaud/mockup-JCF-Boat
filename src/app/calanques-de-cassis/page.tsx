import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content-store";
import { publishedCalanques } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { JsonLd } from "@/components/json-ld";
import { CalanquesShowcase } from "@/components/cassis-page";
import { CalanquesMap } from "@/components/calanques-map";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const page = c.pages.calanques;
  if (!page.published) return { title: "Page indisponible", robots: { index: false } };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.subtitle,
    alternates: { canonical: "/calanques-de-cassis" },
    openGraph: {
      title: `${page.seoTitle || page.title} | ${c.brand.name}`,
      description: page.seoDescription || page.subtitle,
      url: `${SITE_URL}/calanques-de-cassis`,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function CalanquesPage() {
  const content = await getContent();
  const page = content.pages.calanques;
  if (!page.published) notFound();

  const calanques = publishedCalanques(content.calanques);

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: page.title,
          description: page.seoDescription,
          url: `${SITE_URL}/calanques-de-cassis`,
          touristType: "Boat tour / self-drive rental",
          isAccessibleForFree: false,
        }}
      />
      <PageBackground />
      <SiteHeader />

      <article className="relative z-[2]">
        <div className="px-4 pb-4 pt-[calc(5.5rem+env(safe-area-inset-top))] text-center md:px-8 md:pb-6 md:pt-28">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-white/50">
              <Link href="/" className="hover:text-white">
                Accueil
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">Calanques de Cassis</span>
            </nav>
            <p className="mb-2 text-xs font-medium tracking-[0.25em] text-sky-300 uppercase">
              {page.eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {page.title}
            </h1>
          </div>
        </div>

        {calanques.length > 0 ? (
          <div id="calanques">
            <CalanquesShowcase calanques={calanques} />
          </div>
        ) : (
          <p className="px-4 py-16 text-center text-white/60">
            Aucune calanque publiée pour le moment.
          </p>
        )}

        <div className="relative z-[1] mt-2">
          <CalanquesMap calanques={calanques} />
        </div>

        <div className="px-4 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
            <Link
              href="/bateaux"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              Voir les bateaux
            </Link>
            <Link
              href="/location-bateau-cassis"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium text-white hover:bg-white/10"
            >
              Location à Cassis
            </Link>
          </div>
        </div>
      </article>
      <MobileNav />
    </main>
  );
}
