import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CmsTeamMember } from "@/lib/site-content";

type TeamSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  image?: string;
  members?: CmsTeamMember[];
  phoneDisplay?: string;
};

export function TeamSection({
  eyebrow = "Notre équipe",
  title = "Une équipe locale qui connaît chaque calanque",
  subtitle = "Basés à Cassis, nous vous accompagnons pour choisir le bateau et préparer votre sortie.",
  ctaLabel = "Nous contacter",
  image = "/équipe.jpg",
  members = [],
  phoneDisplay,
}: TeamSectionProps) {
  return (
    <section id="team" className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="mb-3 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            {subtitle}
          </p>

          {members.length > 0 && (
            <ul className="mt-8 space-y-4">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex gap-4 rounded-2xl border border-white/15 bg-black/25 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={m.image || image}
                      alt={m.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{m.name}</p>
                    <p className="text-xs text-sky-300">{m.role}</p>
                    {m.bio && (
                      <p className="mt-1 text-sm text-white/70">{m.bio}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button asChild size="lg" className="mt-8">
            <Link href="/#contact">{ctaLabel}</Link>
          </Button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15">
          <Image
            src={image}
            alt="L'équipe JCF Boat à Cassis"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {phoneDisplay && (
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm font-medium text-white/80">Cassis, Bouches-du-Rhône</p>
              <p className="text-lg font-semibold">{phoneDisplay}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
