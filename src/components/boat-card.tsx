"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Boat } from "@/lib/mock-boats";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoatCardProps {
  boat: Boat;
}

export function BoatCard({ boat }: BoatCardProps) {
  const [favorited, setFavorited] = useState(false);

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={boat.image}
          alt={`${boat.year} ${boat.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={() => setFavorited(!favorited)}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
          aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={cn("h-5 w-5 transition-colors", favorited ? "fill-red-500 text-red-500" : "text-slate-400")}
          />
        </button>
        {!boat.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-slate-700">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 md:text-lg">
            {boat.year} {boat.name}
            <span className="ml-2 font-bold text-slate-900">{formatPrice(boat.pricePerDay)}/jour</span>
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {boat.location} · JCF Boat Services
        </p>

        <Button
          asChild
          className="mt-4 w-full"
          size="lg"
          disabled={!boat.available}
        >
          <Link href={`/reservation?boat=${boat.id}`}>
            {boat.available ? "Réserver" : "Me prévenir"}
          </Link>
        </Button>
      </div>
    </article>
  );
}
