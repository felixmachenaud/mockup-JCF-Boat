import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et informations RGPD — JCF Boat, location de bateaux à Cassis.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default async function PrivacyPage() {
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
          <span className="text-white/85">Politique de confidentialité</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Politique de confidentialité
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/80 md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-white">Responsable du traitement</h2>
            <p className="mt-2">
              {content.brand.name} — {content.contact.address}, 13260 Cassis —
              {content.contact.email} — {content.contact.phoneDisplay}.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Données collectées</h2>
            <p className="mt-2">
              Via les formulaires de contact et de demande de réservation : nom,
              adresse e-mail, numéro de téléphone, message, et le cas échéant
              bateau souhaité, date, créneau, nombre de passagers et notes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Finalités et base légale</h2>
            <p className="mt-2">
              Traitement des demandes d&apos;information et de réservation
              (intérêt légitime / mesures précontractuelles). Les messages ne
              sont pas utilisés à des fins publicitaires sans consentement
              distinct.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Destinataires</h2>
            <p className="mt-2">
              L&apos;équipe JCF Boat. Prestataires techniques : hébergeur
              (Vercel), envoi d&apos;e-mails (SMTP OVH), et le cas échéant
              Cloudflare Turnstile pour la protection anti-spam.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Durée de conservation</h2>
            <p className="mt-2">
              Les messages sont conservés le temps nécessaire au traitement de
              la demande, puis au plus 24 mois sauf obligation légale contraire.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Vos droits</h2>
            <p className="mt-2">
              Vous pouvez demander l&apos;accès, la rectification, l&apos;effacement
              ou la limitation de vos données en écrivant à{" "}
              {content.contact.email}. Vous pouvez également introduire une
              réclamation auprès de la CNIL.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
