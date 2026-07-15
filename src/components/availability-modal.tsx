"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Search, Users } from "lucide-react";
import { mockBoats, boatCategories, type Boat } from "@/lib/mock-boats";
import {
  defaultAvailabilitySearch,
  filterBoatsByAvailability,
  getBoatNatureLabel,
  getHalfDaysAvailableUntilWeekEnd,
  todayInputValue,
  type AvailabilitySearch,
} from "@/lib/availability-utils";
import { BookingModal } from "@/components/booking-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AvailabilityModalProps = {
  open: boolean;
  onClose: () => void;
};

const slotOptions = [
  { id: "any" as const, label: "Toute la journée" },
  { id: "morning" as const, label: "Matinée" },
  { id: "afternoon" as const, label: "Après-midi" },
];

export function AvailabilityModal({ open, onClose }: AvailabilityModalProps) {
  const [draft, setDraft] = useState<AvailabilitySearch>(defaultAvailabilitySearch);
  const [appliedSearch, setAppliedSearch] = useState<AvailabilitySearch | null>(null);
  const [bookingBoat, setBookingBoat] = useState<Boat | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !bookingBoat) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, bookingBoat]);

  useEffect(() => {
    if (!open) {
      setDraft(defaultAvailabilitySearch);
      setAppliedSearch(null);
      setBookingBoat(null);
    }
  }, [open]);

  const boats = useMemo(() => {
    if (!appliedSearch) return mockBoats.filter((boat) => boat.available);
    return filterBoatsByAvailability(mockBoats, appliedSearch);
  }, [appliedSearch]);

  if (!open) return null;

  const handleSearch = () => {
    setAppliedSearch({ ...draft });
  };

  const handleReset = () => {
    setDraft(defaultAvailabilitySearch);
    setAppliedSearch(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-4">
        <button
          type="button"
          aria-label="Fermer"
          className="absolute inset-0 bg-white/30 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 md:max-h-[90vh] md:max-w-4xl md:rounded-3xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <p className="text-xs font-medium tracking-[0.15em] text-sky-500 uppercase">
                Disponibilités
              </p>
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Trouver un bateau disponible
              </h2>
              <p className="text-sm text-slate-500">
                {appliedSearch
                  ? "Résultats selon vos critères de recherche"
                  : "Toutes les disponibilités de la flotte cette semaine"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 md:px-6">
            <div className="grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  Personnes
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.people}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      people: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Date</span>
                <input
                  type="date"
                  min={todayInputValue()}
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Créneau</span>
                <select
                  value={draft.slot}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      slot: event.target.value as AvailabilitySearch["slot"],
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  {slotOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Type de bateau
                </span>
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      category: event.target.value as AvailabilitySearch["category"],
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  {boatCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-2 md:justify-end">
                {appliedSearch && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={handleReset}
                  >
                    Tout
                  </Button>
                )}
                <Button
                  type="button"
                  className="h-11 bg-sky-500 px-5 hover:bg-sky-400"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-4 md:px-6">
            {boats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Aucun bateau ne correspond à vos critères
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Modifiez la date, le nombre de personnes ou le type de bateau.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {boats.map((boat) => (
                  <AvailabilityRow
                    key={boat.id}
                    boat={boat}
                    onBook={() => setBookingBoat(boat)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        boat={bookingBoat}
        onClose={() => setBookingBoat(null)}
      />
    </>
  );
}

function AvailabilityRow({
  boat,
  onBook,
}: {
  boat: Boat;
  onBook: () => void;
}) {
  const halfDaysLeft = getHalfDaysAvailableUntilWeekEnd(boat.id, boat.available);

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-32">
        <Image
          src={boat.image}
          alt={boat.name}
          fill
          className="object-cover"
          sizes="128px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 md:text-base">
          {boat.name}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {boat.capacity} pers. · {getBoatNatureLabel(boat)}
        </p>
        <p className="mt-1 text-xs font-medium text-sky-600">
          {halfDaysLeft} demi-journée{halfDaysLeft > 1 ? "s" : ""} disponible
          {halfDaysLeft > 1 ? "s" : ""} jusqu&apos;à la fin de la semaine
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className={cn(
          "w-full shrink-0 bg-sky-500 hover:bg-sky-400 sm:w-auto",
          "whitespace-nowrap"
        )}
        onClick={onBook}
      >
        Voir les créneaux
      </Button>
    </li>
  );
}
