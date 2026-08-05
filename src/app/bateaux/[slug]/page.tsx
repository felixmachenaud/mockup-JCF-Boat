import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content-store";
import {
  boatBySlug,
  boatFromPrice,
  boatPhotoStack,
  publishedBoats,
  relatedBoats,
} from "@/lib/boats";
import { SITE_URL } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { JsonLd } from "@/components/json-ld";
import { BoatCard } from "@/components/boat-card";
import { BoatBookingForm } from "@/components/boat-booking-form";
import { BoatPricingTable } from "@/components/boat-pricing-table";

type Props = { params: Promise<{ slug: string }> };

function categoryLabel(category: string) {
  if (category === "sans-permis") return "Sans permis";
  if (category === "electrique") return "Électrique";
  return "Avec permis";
}

export async function generateStaticParams() {
  const content = await getContent();
  return publishedBoats(content.boats).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const boat = boatBySlug(content.boats, slug);
  if (!boat) return { title: "Bateau introuvable" };

  const from = boatFromPrice(boat);
  const title = boat.seoTitle || `${boat.name} à louer à Cassis`;
  const description =
    boat.seoDescription ||
    boat.shortDescription ||
    boat.description ||
    `Louez le ${boat.name} à Cassis avec JCF Boat. ${boat.capacity} personnes, à partir de ${from} €.`;

  return {
    title,
    description,
    alternates: { canonical: `/bateaux/${boat.slug}` },
    openGraph: {
      title: `${title} | ${content.brand.name}`,
      description,
      url: `${SITE_URL}/bateaux/${boat.slug}`,
      images: boat.image ? [{ url: boat.image }] : undefined,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function BoatDetailPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const boat = boatBySlug(content.boats, slug);
  if (!boat) notFound();

  const photos = boatPhotoStack(boat).slice(0, 3);
  const related = relatedBoats(content.boats, boat);
  const fromPrice = boatFromPrice(boat);

  const specs: Array<{ label: string; value: string }> = [
    { label: "Capacité", value: `${boat.capacity} personnes` },
    { label: "Longueur", value: boat.length },
    { label: "Motorisation", value: boat.motor },
    { label: "Permis", value: boat.license },
    { label: "Type", value: boat.type },
    { label: "Départ", value: boat.location },
  ].filter((s) => s.value.trim().length > 0);

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: boat.name,
          description: boat.description || boat.shortDescription,
          image: photos,
          brand: { "@type": "Brand", name: content.brand.name },
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: boat.pricePerDay || fromPrice,
            availability: boat.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/bateaux/${boat.slug}`,
          },
        }}
      />
      <PageBackground />
      <SiteHeader />

      <article className="relative z-[2] pb-20 pt-[calc(5.5rem+env(safe-area-inset-top))] md:pb-28 md:pt-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-8 text-base text-white/70">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href="/bateaux" className="hover:text-white">
              Bateaux
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{boat.name}</span>
          </nav>

          {/* Colonne photos stretchée jusqu’au bas de la grille tarifaire */}
          <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
            <div className="flex h-full min-h-0 flex-col gap-3 lg:col-span-5">
              {photos.map((src, i) => (
                <div
                  key={src}
                  className={
                    photos.length === 1
                      ? "relative aspect-[4/3] min-h-0 overflow-hidden rounded-2xl border border-white/15 lg:aspect-auto lg:min-h-[20rem] lg:flex-1"
                      : photos.length === 2
                        ? "relative aspect-[4/3] min-h-0 overflow-hidden rounded-2xl border border-white/15 lg:aspect-auto lg:min-h-[12rem] lg:flex-1"
                        : "relative aspect-[4/3] min-h-0 overflow-hidden rounded-2xl border border-white/15 lg:aspect-auto lg:min-h-[8rem] lg:flex-1"
                  }
                >
                  <Image
                    src={src}
                    alt={`${boat.name} — photo ${i + 1}`}
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:col-span-7">
              <div className="rounded-2xl border border-white/15 bg-black/30 p-5 md:p-7">
                <p className="text-sm font-medium tracking-[0.22em] text-sky-300 uppercase md:text-base">
                  {categoryLabel(boat.category)}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  {boat.name}
                </h1>
                {boat.shortDescription ? (
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-white md:text-xl">
                    {boat.shortDescription}
                  </p>
                ) : null}

                {boat.description && boat.description !== boat.shortDescription ? (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
                    {boat.description}
                  </p>
                ) : null}

                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-3">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt className="text-sm tracking-wide text-white/80 uppercase md:text-base">
                        {s.label}
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-white md:text-lg">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {boat.features.length > 0 ? (
                  <div className="mt-10">
                    <h2 className="text-sm font-medium tracking-[0.18em] text-white uppercase md:text-base">
                      Confort & équipements
                    </h2>
                    <ul className="mt-4 flex flex-wrap gap-2.5">
                      {boat.features.map((f) => (
                        <li
                          key={f}
                          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white md:text-base"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <BoatPricingTable boat={boat} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-white md:text-lg">
              À partir de{" "}
              <span className="font-semibold">{formatPrice(fromPrice)}</span>
              {" · "}
              réservation sur place, par téléphone ou formulaire.
            </p>
            <a
              href={`tel:${content.contact.phone}`}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-slate-900 hover:bg-white/90"
            >
              Appeler {content.contact.phoneDisplay}
            </a>
          </div>

          {boat.includedServices.length > 0 ? (
            <p className="mt-4 text-sm text-white/85 md:text-base">
              Inclus : {boat.includedServices.join(" · ")}
            </p>
          ) : null}
        </div>

        {/* Formulaire pleine largeur */}
        <section className="mt-14 w-full px-4 md:px-8">
          <BoatBookingForm
            boatName={boat.name}
            maxPassengers={boat.capacity}
            phoneDisplay={content.contact.phoneDisplay}
            phoneHref={content.contact.phone}
            className="mx-auto max-w-6xl"
          />
        </section>

        <div className="mx-auto mt-20 max-w-5xl px-4 md:px-8">
          {related.length > 0 && (
            <section className="border-t border-white/10 pt-12">
              <h2 className="text-lg font-semibold text-white">Bateaux similaires</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((b) => (
                  <BoatCard key={b.id} boat={b} />
                ))}
              </div>
            </section>
          )}

          <aside className="mt-16 border-t border-white/10 pt-10">
            <h2 className="text-lg font-semibold text-white">Continuer votre découverte</h2>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              <li>
                <Link href="/bateaux" className="text-sky-300 hover:underline">
                  Toute la flotte
                </Link>
              </li>
              <li>
                <Link
                  href="/location-bateau-cassis"
                  className="text-sky-300 hover:underline"
                >
                  Location de bateau à Cassis
                </Link>
              </li>
              <li>
                <Link
                  href="/calanques-de-cassis"
                  className="text-sky-300 hover:underline"
                >
                  Calanques de Cassis
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </article>
      <MobileNav />
    </main>
  );
}
