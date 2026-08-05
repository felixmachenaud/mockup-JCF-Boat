"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-white/50 outline-none transition focus:border-sky-200/70 focus:ring-2 focus:ring-sky-300/40";

const labelClass = "mb-1.5 block text-sm font-medium tracking-wide text-white md:text-base";

type BoatBookingFormProps = {
  boatName: string;
  maxPassengers?: number;
  phoneDisplay?: string;
  phoneHref?: string;
  className?: string;
};

export function BoatBookingForm({
  boatName,
  maxPassengers = 12,
  phoneDisplay,
  phoneHref,
  className,
}: BoatBookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking",
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          boatName: String(fd.get("boatName") || boatName),
          date: String(fd.get("date") || ""),
          period: String(fd.get("period") || ""),
          passengers: Number(fd.get("passengers") || 0),
          notes: String(fd.get("notes") || ""),
          website: String(fd.get("website") || ""),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Envoi impossible. Réessayez ou appelez-nous.");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Envoi impossible. Réessayez ou appelez-nous.");
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className={cn(
        "rounded-3xl border border-sky-300/35 bg-sky-500/25 p-6 shadow-[0_12px_40px_rgba(14,165,233,0.12)] backdrop-blur-md md:p-10",
        className,
      )}
    >
      <p className="text-sm font-medium tracking-[0.2em] text-sky-100 uppercase md:text-base">
        Réservation
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Envoyez-nous votre réservation
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-white md:text-lg">
        Indiquez la date, le nom du bateau, le créneau (matinée ou après-midi), le nombre de
        passagers, ainsi que vos notes ou informations utiles.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="booking-name" className={labelClass}>
              Nom *
            </label>
            <input
              id="booking-name"
              name="name"
              required
              autoComplete="name"
              className={fieldClass}
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label htmlFor="booking-email" className={labelClass}>
              Email *
            </label>
            <input
              id="booking-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              placeholder="vous@email.fr"
            />
          </div>
          <div>
            <label htmlFor="booking-phone" className={labelClass}>
              Téléphone *
            </label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className={fieldClass}
              placeholder="06 …"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="booking-date" className={labelClass}>
              Date *
            </label>
            <input
              id="booking-date"
              name="date"
              type="date"
              required
              min={today}
              className={`${fieldClass} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label htmlFor="booking-boat" className={labelClass}>
              Nom du bateau *
            </label>
            <input
              id="booking-boat"
              name="boatName"
              required
              defaultValue={boatName}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="booking-passengers" className={labelClass}>
              Passagers *
            </label>
            <input
              id="booking-passengers"
              name="passengers"
              type="number"
              required
              min={1}
              max={maxPassengers}
              defaultValue={2}
              className={fieldClass}
            />
          </div>
          <fieldset>
            <legend className={labelClass}>Créneau *</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex min-h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white has-[:checked]:border-sky-200/60 has-[:checked]:bg-sky-400/25 md:text-base">
                <input
                  type="radio"
                  name="period"
                  value="matinee"
                  required
                  className="accent-sky-300"
                />
                Matinée
              </label>
              <label className="flex min-h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white has-[:checked]:border-sky-200/60 has-[:checked]:bg-sky-400/25 md:text-base">
                <input
                  type="radio"
                  name="period"
                  value="apres-midi"
                  className="accent-sky-300"
                />
                Après-midi
              </label>
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="booking-notes" className={labelClass}>
            Notes / informations
          </label>
          <textarea
            id="booking-notes"
            name="notes"
            rows={3}
            className={`${fieldClass} min-h-[5.5rem] resize-y rounded-2xl`}
            placeholder="Horaires souhaités, expérience en mer, besoins particuliers…"
          />
        </div>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {status === "success" && (
          <p className="rounded-2xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-base text-emerald-50">
            Demande envoyée. Nous vous confirmons la disponibilité rapidement.
          </p>
        )}
        {status === "error" && error && (
          <p className="rounded-2xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-base text-red-50">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            disabled={status === "loading"}
            className="w-full border border-sky-200/80 bg-white text-base font-semibold text-sky-600 shadow-sm hover:bg-sky-50 hover:text-sky-700 sm:w-auto"
          >
            {status === "loading" ? "Envoi…" : "Envoyer la demande"}
          </Button>
          {phoneHref && phoneDisplay && (
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 text-base font-medium text-white transition hover:bg-white/15"
            >
              Appeler {phoneDisplay}
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
