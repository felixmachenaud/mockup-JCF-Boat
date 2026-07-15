import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Anchor, Shield, MapPin, Users } from "lucide-react";
import Image from "next/image";

const trustSignals = [
  { icon: Shield, label: "Assuré" },
  { icon: Anchor, label: "Capitaine certifié" },
  { icon: MapPin, label: "Experts locaux" },
  { icon: Users, label: "Entreprise familiale" },
];

export function TeamSection() {
  return (
    <section id="team" className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="mb-3 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            Notre équipe
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Une équipe locale qui connaît chaque calanque
          </h2>
          <div className="mt-6 max-w-lg space-y-4 text-sm leading-relaxed text-white/75 md:text-base">
            <p>
              Basés à Cassis depuis des années, nous connaissons chaque recoin des calanques
              comme notre poche. JCF Boat Services, c&apos;est une passion pour la mer transmise
              de génération en génération.
            </p>
            <p>
              Nous vous accompagnons de A à Z : choix du bateau, briefing sécurité, itinéraires
              secrets et conseils pour profiter pleinement de votre journée en Méditerranée.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {trustSignals.map(({ icon: Icon, label }) => (
              <Badge
                key={label}
                variant="secondary"
                className="gap-1.5 border border-white/15 bg-black/30 px-3 py-1 text-white/90"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Badge>
            ))}
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link href="/reservation">Réserver avec notre équipe</Link>
          </Button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15">
          <Image
            src="/équipe.jpg"
            alt="L'équipe JCF Boat Services à Cassis"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-sm font-medium text-white/80">Cassis, Bouches-du-Rhône</p>
            <p className="text-lg font-semibold">06 75 74 25 81</p>
          </div>
        </div>
      </div>
    </section>
  );
}
