"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mockBoats } from "@/lib/mock-boats";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";

function ReservationForm() {
  const searchParams = useSearchParams();
  const boatId = searchParams.get("boat");
  const selectedBoat = useMemo(
    () => mockBoats.find((boat) => boat.id === boatId) ?? mockBoats[0],
    [boatId]
  );

  return (
    <main className="relative min-h-screen px-4 pb-mobile-nav pt-[calc(5rem+env(safe-area-inset-top))] md:px-8 md:pb-16 md:pt-28">
      <PageBackground />
      <SiteHeader />

      <div className="relative mx-auto max-w-2xl">
        <Link
          href="/#fleet"
          className="mb-6 inline-block text-sm text-white/70 transition-colors hover:text-white"
        >
          ← Retour aux bateaux
        </Link>

        <div className="rounded-3xl border border-white/15 bg-black/35 p-6 md:p-10">
          <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            Réservation
          </p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Réserver {selectedBoat.name}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            À partir de {formatPrice(selectedBoat.priceHalfDay)}/demi-journée ·{" "}
            {formatPrice(selectedBoat.pricePerDay)}/jour
          </p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Bateau
              </label>
              <select
                defaultValue={selectedBoat.id}
                className="h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-sm text-white outline-none focus:border-sky-400"
              >
                {mockBoats.filter((b) => b.available).map((boat) => (
                  <option key={boat.id} value={boat.id} className="bg-slate-900">
                    {boat.name} — {formatPrice(boat.pricePerDay)}/jour
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Prénom
                </label>
                <Input
                  required
                  placeholder="Jean"
                  className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Nom
                </label>
                <Input
                  required
                  placeholder="Dupont"
                  className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Email
                </label>
                <Input
                  required
                  type="email"
                  placeholder="jean@email.com"
                  className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Téléphone
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="06 00 00 00 00"
                  className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Date
                </label>
                <Input
                  required
                  type="date"
                  className="border-white/20 bg-black/30 text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Formule
                </label>
                <select className="h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-sm text-white outline-none focus:border-sky-400">
                  <option className="bg-slate-900">Demi-journée</option>
                  <option className="bg-slate-900">Journée complète</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Message (optionnel)
              </label>
              <textarea
                rows={3}
                placeholder="Nombre de personnes, expérience en mer..."
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky-400"
              />
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full">
              Confirmer ma demande de réservation
            </Button>

            <p className="text-center text-xs text-white/50">
              Réponse sous 2h · Paiement sécurisé à la confirmation
            </p>
          </form>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

export default function ReservationPage() {
  return (
    <Suspense>
      <ReservationForm />
    </Suspense>
  );
}
