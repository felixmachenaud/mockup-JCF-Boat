"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calanques } from "@/lib/calanques";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ExpandingGallery({
  calanque,
  index,
}: {
  calanque: (typeof calanques)[0];
  index: number;
}) {
  const [active, setActive] = useState(0);

  const scrollToMap = () => {
    document.getElementById("carte-calanques")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <article id={calanque.id} className="scroll-mt-32 px-4 py-10 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 max-w-xl md:mb-8">
          <p className="text-xs font-medium tracking-[0.25em] text-sky-300 uppercase">
            Calanque {index + 1}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">
            {calanque.name}
          </h2>
          <p className="mt-2 text-sm font-medium text-white/80">{calanque.subtitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
            {calanque.description}
          </p>
          <p className="mt-3 inline-block rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
            {calanque.highlight}
          </p>
        </div>

        {/* Mobile — image principale + miniatures tactiles */}
        <div className="md:hidden">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15">
            <Image
              src={calanque.images[active]}
              alt={`${calanque.name} — vue ${active + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {calanque.images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Voir la photo ${i + 1} de ${calanque.name}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all active:scale-95",
                  active === i
                    ? "border-sky-400 ring-2 ring-sky-400/30"
                    : "border-white/20 opacity-75"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop — bandeau expansible au survol */}
        <div
          className="hidden h-[400px] gap-3 md:flex lg:h-[520px]"
          onMouseLeave={() => setActive(0)}
        >
          {calanque.images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Agrandir la photo ${i + 1}`}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 transition-all duration-500 ease-out",
                active === i ? "flex-[5]" : "min-w-[64px] flex-[1]"
              )}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <Image
                src={src}
                alt={`${calanque.name} — vue ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 90vw, 50vw"
                priority={i === 0}
              />
              {active !== i && (
                <div className="absolute inset-0 bg-black/25 transition-opacity duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild className="h-12 w-full bg-sky-500 hover:bg-sky-400 sm:w-auto">
            <Link href="/#fleet">Y aller</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border-white/30 bg-white text-slate-900 hover:bg-white/90 sm:w-auto"
            onClick={scrollToMap}
          >
            Voir sur la carte
          </Button>
          <a
            href={calanque.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center text-sm text-white/50 underline-offset-2 active:text-white/80 hover:text-white/80 hover:underline"
          >
            Google Maps →
          </a>
        </div>
      </div>
    </article>
  );
}

export function CalanquesShowcase() {
  return (
    <div>
      {calanques.map((calanque, index) => (
        <ExpandingGallery key={calanque.id} calanque={calanque} index={index} />
      ))}
    </div>
  );
}

export function CassisSubNav({
  active,
  onChange,
}: {
  active: "calanques" | "meteo";
  onChange: (tab: "calanques" | "meteo") => void;
}) {
  return (
    <div className="sticky top-[calc(4.5rem+env(safe-area-inset-top))] z-40 mx-auto flex max-w-md justify-center px-4 py-4 md:top-20 md:py-6">
      <div className="flex w-full rounded-full border border-white/25 bg-black/50 p-1 backdrop-blur-xl">
        {(
          [
            { id: "calanques" as const, label: "Calanques" },
            { id: "meteo" as const, label: "Météo" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "min-h-11 flex-1 rounded-full px-3 py-2.5 text-xs font-medium transition-colors active:scale-[0.98] md:px-4 md:text-sm",
              active === id
                ? "bg-white text-slate-900"
                : "text-white/75 active:bg-white/10 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CassisWeather() {
  const forecast = [
    { day: "Aujourd'hui", temp: "27°C", wind: "12 nds NW", sea: "Mer belle", icon: "☀️" },
    { day: "Demain", temp: "26°C", wind: "15 nds W", sea: "Mer peu agitée", icon: "⛅" },
    { day: "Après-demain", temp: "25°C", wind: "10 nds SW", sea: "Mer belle", icon: "🌤️" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 md:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm text-white/65">
          Conditions actuelles au port de Cassis — idéal pour planifier votre sortie.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {forecast.map((item) => (
          <div
            key={item.day}
            className="rounded-2xl border border-white/15 bg-black/30 p-5 text-center"
          >
            <p className="text-2xl">{item.icon}</p>
            <p className="mt-2 text-sm font-medium text-white">{item.day}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{item.temp}</p>
            <p className="mt-2 text-xs text-white/60">{item.wind}</p>
            <p className="mt-1 text-xs text-sky-300">{item.sea}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link href="/#fleet">Réserver selon la météo</Link>
        </Button>
      </div>
    </div>
  );
}
