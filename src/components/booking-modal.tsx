"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Users, Ruler, Zap, Anchor, Check } from "lucide-react";
import type { Boat } from "@/lib/mock-boats";
import { getBoatSpecs } from "@/lib/mock-boats";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCmsImageSrc } from "@/lib/cms-image";

type BookingModalProps = {
  boat: Boat | null;
  onClose: () => void;
};

type TimeSlot = "morning" | "afternoon" | "full";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const slotOptions: { id: TimeSlot; label: string; detail: string }[] = [
  { id: "morning", label: "Matinée", detail: "8h – 13h" },
  { id: "afternoon", label: "Après-midi", detail: "14h – 19h" },
  { id: "full", label: "Journée", detail: "8h – 19h" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getUnavailableDays(boatId: string, year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const unavailable = new Set<number>();
  for (let d = 1; d <= days; d++) {
    const hash = (boatId.charCodeAt(0) + month * 31 + d * 7) % 5;
    if (hash === 0) unavailable.add(d);
  }
  return unavailable;
}

function getSlotPrice(boat: Boat, slot: TimeSlot) {
  return slot === "full" ? boat.pricePerDay : boat.priceHalfDay;
}

function getSlotLabel(slot: TimeSlot) {
  if (slot === "morning") return "Matinée (8h–13h)";
  if (slot === "afternoon") return "Après-midi (14h–19h)";
  return "Journée complète";
}

export function BookingModal({ boat, onClose }: BookingModalProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<TimeSlot>("morning");

  const specs = useMemo(() => (boat ? getBoatSpecs(boat) : null), [boat]);

  const unavailable = useMemo(
    () => (boat ? getUnavailableDays(boat.id, year, month) : new Set<number>()),
    [boat, year, month]
  );

  const firstWeekday = new Date(year, month, 1).getDay();
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth = getDaysInMonth(year, month);

  useEffect(() => {
    if (!boat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [boat, onClose]);

  if (!boat || !specs) return null;

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const specRows = [
    { icon: Ruler, label: "Longueur", value: specs.length },
    { icon: Zap, label: "Motorisation", value: specs.motor },
    { icon: Users, label: "Capacité", value: `${boat.capacity} pers.` },
    { icon: Anchor, label: "Permis", value: specs.license },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center md:items-center md:p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-white/30 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 md:max-h-[90vh] md:max-w-3xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
              {isCmsImageSrc(boat.image) ? (
                <Image src={boat.image} alt={boat.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.15em] text-sky-500 uppercase">
                Réservation
              </p>
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{boat.name}</h2>
              <p className="text-sm text-slate-500">
                {formatPrice(getSlotPrice(boat, slot))} · {getSlotLabel(slot)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 capitalize">{monthLabel}</h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Mois précédent"
                    className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-500 transition-colors hover:border-sky-200 hover:text-sky-600 active:scale-95"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Mois suivant"
                    className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-500 transition-colors hover:border-sky-200 hover:text-sky-600 active:scale-95"
                  >
                    →
                  </button>
                </div>
              </div>

              <p className="mb-2 text-xs font-medium text-slate-500">Créneau</p>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {slotOptions.map(({ id, label, detail }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSlot(id)}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-center transition-colors active:scale-[0.98]",
                      slot === id
                        ? "border-sky-400 bg-sky-50 ring-1 ring-sky-200"
                        : "border-slate-200 bg-white hover:border-sky-200"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-xs font-semibold sm:text-sm",
                        slot === id ? "text-sky-600" : "text-slate-700"
                      )}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-center text-[11px] text-slate-400 sm:text-xs">
                      {detail}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
                {WEEKDAYS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isPast =
                    year < today.getFullYear() ||
                    (year === today.getFullYear() && month < today.getMonth()) ||
                    (year === today.getFullYear() &&
                      month === today.getMonth() &&
                      day < today.getDate());
                  const isUnavailable = unavailable.has(day) || isPast || !boat.available;
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "flex aspect-square min-h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors active:scale-95",
                        isSelected && "bg-sky-500 text-white shadow-sm",
                        !isSelected &&
                          !isUnavailable &&
                          "text-slate-700 hover:bg-sky-50 hover:text-sky-600",
                        isUnavailable && "cursor-not-allowed text-slate-200"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                Dates grisées = indisponibles · Confirmation sous 2h
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Fiche technique</h3>
              <dl className="overflow-hidden rounded-xl border border-slate-100">
                {specRows.map(({ icon: Icon, label, value }, index) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      index > 0 && "border-t border-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-sky-500" />
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="ml-auto text-sm font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {specs.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 md:px-6">
          {selectedDay ? (
            <Button asChild size="lg" className="w-full bg-sky-500 hover:bg-sky-400">
              <Link
                href={`/reservation?boat=${boat.id}&date=${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}&slot=${slot}`}
                onClick={onClose}
              >
                Confirmer — {selectedDay}/{month + 1} · {slotOptions.find((s) => s.id === slot)?.label}
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full bg-sky-300" disabled>
              Sélectionnez une date
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
