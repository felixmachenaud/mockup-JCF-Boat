import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site JCF Boat — location de bateaux à Cassis.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default async function MentionsLegalesPage() {
  const content = await getContent();

  return (
    <main className="relative min-h-screen pb-20">
      <PageBackground />
      <SiteHeader
        brandName={content.brand.name}
        phone={content.contact.phone}
        phoneDisplay={content.contact.phoneDisplay}
      />
      <article className="relative z-[2] mx-auto max-w-3xl px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] text-white md:px-8 md:pt-32">
        <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-white/60">
          <Link href="/" className="hover:text-white">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/85">Mentions légales</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Mentions légales
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/80 md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-white">Éditeur</h2>
            <p className="mt-2">
              {content.brand.name}
              <br />
              {content.contact.address}, 13260 Cassis, France
              <br />
              Téléphone : {content.contact.phoneDisplay}
              <br />
              Email : {content.contact.email}
            </p>
            <p className="mt-2 text-white/55">
              Complétez ici la raison sociale, le SIREN/SIRET et le nom du
              responsable de publication dès que ces informations sont
              confirmées.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Hébergement</h2>
            <p className="mt-2">
              Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Propriété intellectuelle</h2>
            <p className="mt-2">
              Les textes, photographies et éléments graphiques du site sont
              protégés. Toute reproduction non autorisée est interdite.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
