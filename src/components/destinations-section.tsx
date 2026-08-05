import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

type Props = {
  content: SiteContent["destinations"];
  locationTitle: string;
  locationEyebrow: string;
  locationBlurb: string;
  calanquesTitle: string;
  calanquesEyebrow: string;
  calanquesBlurb: string;
};

export function DestinationsSection({
  content,
  locationTitle,
  locationEyebrow,
  locationBlurb,
  calanquesTitle,
  calanquesEyebrow,
  calanquesBlurb,
}: Props) {
  return (
    <section
      id="destinations"
      className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
            {content.subtitle}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/location-bateau-cassis"
            className="group rounded-3xl border border-white/15 bg-black/30 p-8 transition hover:border-white/30 hover:bg-black/40"
          >
            <p className="text-xs font-medium tracking-[0.2em] text-sky-300 uppercase">
              {locationEyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white group-hover:underline">
              {locationTitle}
            </h3>
            <p className="mt-3 text-sm text-white/70">{locationBlurb}</p>
            <span className="mt-6 inline-block text-sm font-medium text-sky-300">
              Découvrir →
            </span>
          </Link>

          <Link
            href="/calanques-de-cassis"
            className="group rounded-3xl border border-white/15 bg-black/30 p-8 transition hover:border-white/30 hover:bg-black/40"
          >
            <p className="text-xs font-medium tracking-[0.2em] text-sky-300 uppercase">
              {calanquesEyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white group-hover:underline">
              {calanquesTitle}
            </h3>
            <p className="mt-3 text-sm text-white/70">{calanquesBlurb}</p>
            <span className="mt-6 inline-block text-sm font-medium text-sky-300">
              Explorer →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
