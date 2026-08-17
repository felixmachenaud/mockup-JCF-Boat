import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Conditions de location",
  description:
    "Conditions générales de location de bateaux JCF Boat à Cassis — caution, annulation, sécurité.",
  alternates: { canonical: "/conditions-de-location" },
};

export default async function RentalTermsPage() {
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
          <span className="text-white/85">Conditions de location</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Conditions de location
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/80 md:text-base">
          <p>
            Les demandes envoyées via le site constituent une prise de contact
            et non une réservation ferme. La confirmation se fait auprès de
            l&apos;équipe JCF Boat (téléphone, e-mail ou au port).
          </p>
          <section>
            <h2 className="text-lg font-semibold text-white">Conducteur & permis</h2>
            <p className="mt-2">
              Selon le bateau, un permis côtier peut être exigé. Une pièce
              d&apos;identité est demandée pour le conducteur. Le briefing de
              sécurité est obligatoire avant départ.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Caution & carburant</h2>
            <p className="mt-2">
              Une caution peut être demandée. La politique carburant
              (plein/plein ou forfait) est précisée à la réservation — faites
              valider les conditions avant le départ.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Annulation</h2>
            <p className="mt-2">
              En cas de météo défavorable ou d&apos;interdiction de navigation,
              un report ou un avoir peut être proposé. Les conditions précises
              d&apos;annulation / remboursement sont confirmées lors de la
              réservation.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Sécurité</h2>
            <p className="mt-2">
              Respectez les consignes du briefing, les zones réglementées du
              Parc national des Calanques et les conditions de mer. Les gilets
              sont à bord pour tous les passagers.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
