"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  mockBoats,
  boatCategories,
  type Boat,
  type BoatCategoryFilter,
} from "@/lib/mock-boats";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/booking-modal";
import { AvailabilityButton } from "@/components/availability-button";
import { cn } from "@/lib/utils";

type FleetSectionProps = {
  onOpenAvailability?: () => void;
};

export function FleetSection({ onOpenAvailability }: FleetSectionProps) {
  const [category, setCategory] = useState<BoatCategoryFilter>("all");
  const [bookingBoat, setBookingBoat] = useState<Boat | null>(null);

  const boats = useMemo(() => {
    if (category === "all") return mockBoats;
    return mockBoats.filter((boat) => boat.category === category);
  }, [category]);

  return (
    <>
      <section id="fleet" className="relative scroll-mt-28 px-4 pb-20 pt-4 md:px-8 md:pb-28 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
              Les bateaux
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Choisissez votre expérience en mer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              Flotte premium à Cassis — avec permis, sans permis ou 100 % électrique.
            </p>
          </div>

          <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-white/20 bg-black/30 p-2">
              {boatCategories.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={cn(
                    "min-h-11 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                    category === id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <AvailabilityButton onClick={onOpenAvailability} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boats.map((boat) => (
              <article
                key={boat.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/25"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={boat.image}
                    alt={boat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  {!boat.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">
                        Indisponible
                      </span>
                    </div>
                  )}
                  {boat.category !== "standard" && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                      {boat.category === "sans-permis" ? "Sans permis" : "Électrique"}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white md:text-base">
                      {boat.name}
                    </h3>
                    <div className="flex shrink-0 items-center gap-0.5 text-xs text-white/80">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {boat.rating}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-white/60">
                    {boat.capacity} pers. · {boat.type} · {boat.location}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-white">
                    {formatPrice(boat.pricePerDay)}
                    <span className="font-normal text-white/60">/jour</span>
                  </p>

                  {boat.slotsLeft && boat.available && (
                    <p className="mt-1 text-[11px] font-medium text-sky-300">
                      {boat.slotsLeft} créneau{boat.slotsLeft > 1 ? "x" : ""} restant
                      {boat.slotsLeft > 1 ? "s" : ""} cette semaine
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="mt-4 w-full bg-white text-slate-900 hover:bg-white/90"
                    disabled={!boat.available}
                    onClick={() => setBookingBoat(boat)}
                  >
                    Réserver
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BookingModal boat={bookingBoat} onClose={() => setBookingBoat(null)} />
    </>
  );
}
