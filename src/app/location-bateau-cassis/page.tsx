import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content-store";
import { boatsByIds } from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { JsonLd } from "@/components/json-ld";
import { BoatCard } from "@/components/boat-card";
import { buildBreadcrumbList, BUSINESS_ID } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const page = c.pages.location;
  if (!page.published) return { title: "Page indisponible", robots: { index: false } };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.subtitle,
    alternates: { canonical: "/location-bateau-cassis" },
    openGraph: {
      title: `${page.seoTitle || page.title} | ${c.brand.name}`,
      description: page.seoDescription || page.subtitle,
      url: `${SITE_URL}/location-bateau-cassis`,
      images: page.image ? [{ url: page.image }] : [{ url: "/mana23.1.jpg" }],
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function PillarPage() {
  const content = await getContent();
  const page = content.pages.location;
  if (!page.published) notFound();

  const boats = boatsByIds(content.boats, page.featuredBoatIds);

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <JsonLd
        data={buildBreadcrumbList([
          { name: "Accueil", path: "/" },
          { name: "Location bateau Cassis", path: "/location-bateau-cassis" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: page.title,
          provider: { "@id": BUSINESS_ID },
          areaServed: "Cassis",
          description: page.seoDescription,
          url: `${SITE_URL}/location-bateau-cassis`,
        }}
      />
      <PageBackground />
      <SiteHeader
        brandName={content.brand.name}
        phone={content.contact.phone}
        phoneDisplay={content.contact.phoneDisplay}
      />

      <article className="relative z-[2] px-4 pb-20 pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-8 md:pb-28 md:pt-32">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-white/50">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Location bateau Cassis</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.25em] text-sky-300 uppercase">
                {page.eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {page.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
                {page.subtitle}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
                {page.intro}
              </p>
            </div>
            {page.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15">
                <Image
                  src={page.image}
                  alt={page.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            )}
          </div>

          {page.reasons.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold text-white">
                Pourquoi louer un bateau à Cassis ?
              </h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-white/80 md:text-base">
                {page.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-black/25 p-6">
              <h2 className="text-lg font-semibold text-white">Infos pratiques</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 whitespace-pre-line">
                {page.practicalInfo}
              </p>
              <p className="mt-4 text-sm text-white/70">
                Départ : {content.contact.address} · {content.contact.phoneDisplay}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/25 p-6">
              <h2 className="text-lg font-semibold text-white">Sécurité & accès</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 whitespace-pre-line">
                {page.safetyInfo}
              </p>
            </div>
          </section>

          {boats.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-semibold text-white">Bateaux recommandés</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {boats.map((boat) => (
                  <BoatCard key={boat.id} boat={boat} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              {page.ctaLabel}
            </Link>
            <Link
              href="/calanques-de-cassis"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium text-white hover:bg-white/10"
            >
              Découvrir les calanques
            </Link>
            <Link
              href="/bateaux"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium text-white hover:bg-white/10"
            >
              Toute la flotte
            </Link>
          </div>
        </div>
      </article>
      <MobileNav />
    </main>
  );
}
