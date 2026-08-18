import Image from "next/image";
import Link from "next/link";
import type { CmsBoat } from "@/lib/site-content";
import { boatFromPrice } from "@/lib/boats";
import { formatPrice } from "@/lib/utils";
import { isCmsImageSrc } from "@/lib/cms-image";

type BoatCardProps = {
  boat: CmsBoat;
};

export function BoatCard({ boat }: BoatCardProps) {
  const blurb = boat.shortDescription || boat.description;
  const from = boatFromPrice(boat);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/25">
      <Link
        href={`/bateaux/${boat.slug}`}
        className="relative aspect-[4/3] overflow-hidden"
      >
        {isCmsImageSrc(boat.image) ? (
          <Image
            src={boat.image}
            alt={`${boat.name} — location bateau Cassis`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-black/40" />
        )}
        {!boat.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">
              Indisponible
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white">
          <Link href={`/bateaux/${boat.slug}`} className="hover:underline">
            {boat.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-white/55">
          {boat.capacity} pers. · {boat.type} · {boat.license}
        </p>
        {blurb ? (
          <p className="mt-2 line-clamp-2 text-sm text-white/70">{blurb}</p>
        ) : null}
        <p className="mt-3 text-base font-semibold text-white">
          <span className="text-sm font-normal text-white/50">À partir de </span>
          {formatPrice(from)}
        </p>
        <Link
          href={`/bateaux/${boat.slug}`}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-slate-900 hover:bg-white/90"
        >
          Voir la fiche
        </Link>
      </div>
    </article>
  );
}
