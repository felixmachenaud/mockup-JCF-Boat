import Link from "next/link";
import type { CmsBoat } from "@/lib/site-content";
import { BoatCard } from "@/components/boat-card";
import { Button } from "@/components/ui/button";

type FleetSectionProps = {
  boats: CmsBoat[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  viewAllLabel?: string;
};

export function FleetSection({
  boats,
  eyebrow = "Les bateaux",
  title = "Une sélection pour votre sortie",
  subtitle = "Quelques bateaux mis en avant — toute la flotte est disponible sur catalogue.",
  viewAllLabel = "Voir tous les bateaux",
}: FleetSectionProps) {
  return (
    <section
      id="bateaux"
      className="relative scroll-mt-28 px-4 pb-20 pt-4 md:px-8 md:pb-28 md:pt-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
            {subtitle}
          </p>
        </div>

        {boats.length === 0 ? (
          <p className="text-center text-sm text-white/60">
            Aucun bateau mis en avant pour le moment.{" "}
            <Link href="/bateaux" className="text-sky-300 hover:underline">
              Voir le catalogue
            </Link>
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
            <Link href="/bateaux">{viewAllLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
