import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content-store";
import { boatsByIds, publishedCalanques } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";
import { isCmsImageSrc } from "@/lib/cms-image";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { JsonLd } from "@/components/json-ld";
import { CalanquesShowcase } from "@/components/cassis-page";
import { CalanquesMap } from "@/components/calanques-map";
import { BoatCard } from "@/components/boat-card";
import { buildBreadcrumbList } from "@/lib/schema";

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
      images: page.image ? [{ url: page.image }] : [{ url: "/mana23.1.jpg" }],
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
  const boats = boatsByIds(content.boats, page.featuredBoatIds);
  const headerProps = {
    brandName: content.brand.name,
    phone: content.contact.phone,
    phoneDisplay: content.contact.phoneDisplay,
  };

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <JsonLd
        data={buildBreadcrumbList([
          { name: "Accueil", path: "/" },
          { name: "Calanques de Cassis", path: "/calanques-de-cassis" },
        ])}
      />
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
      <SiteHeader {...headerProps} />

      <article className="relative z-[2]">
        <div className="px-4 pb-4 pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-8 md:pb-6 md:pt-28">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Fil d'Ariane" className="mb-5 text-center text-sm text-white/50 md:text-left">
              <Link href="/" className="hover:text-white">
                Accueil
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">Calanques de Cassis</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="text-center lg:text-left">
                <p className="mb-2 text-xs font-medium tracking-[0.25em] text-sky-300 uppercase">
                  {page.eyebrow}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  {page.title}
                </h1>
                {page.subtitle ? (
                  <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
                    {page.subtitle}
                  </p>
                ) : null}
                {page.intro ? (
                  <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
                    {page.intro}
                  </p>
                ) : null}
              </div>
              {isCmsImageSrc(page.image) ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15">
                  <Image
                    src={page.image}
                    alt={page.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {page.reasons.length > 0 ? (
              <section className="mt-12">
                <h2 className="text-xl font-semibold text-white">
                  Pourquoi découvrir les calanques en bateau ?
                </h2>
                <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-white/80 md:text-base">
                  {page.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(page.practicalInfo || page.safetyInfo) && (
              <section className="mt-12 grid gap-6 md:grid-cols-2">
                {page.practicalInfo ? (
                  <div className="rounded-2xl border border-white/15 bg-black/25 p-6">
                    <h2 className="text-lg font-semibold text-white">Infos pratiques</h2>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/75">
                      {page.practicalInfo}
                    </p>
                  </div>
                ) : null}
                {page.safetyInfo ? (
                  <div className="rounded-2xl border border-white/15 bg-black/25 p-6">
                    <h2 className="text-lg font-semibold text-white">Sécurité & accès</h2>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/75">
                      {page.safetyInfo}
                    </p>
                  </div>
                ) : null}
              </section>
            )}
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

        {boats.length > 0 ? (
          <div className="px-4 py-12 md:px-8">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl font-semibold text-white">Bateaux recommandés</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {boats.map((boat) => (
                  <BoatCard key={boat.id} boat={boat} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="px-4 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
            <Link
              href="/bateaux"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              {page.ctaLabel}
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
