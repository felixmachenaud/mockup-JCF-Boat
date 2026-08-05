import Image from "next/image";
import type { SiteContent } from "@/lib/site-content";

type Props = {
  content: SiteContent["presentation"];
};

export function PresentationSection({ content }: Props) {
  return (
    <section
      id="presentation"
      className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="mb-3 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            {content.text}
          </p>
          {content.highlights.length > 0 && (
            <ul className="mt-8 space-y-4">
              {content.highlights.map((h) => (
                <li
                  key={h.id}
                  className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  <p className="mt-1 text-sm text-white/70">{h.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {content.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15">
            <Image
              src={content.image}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  );
}
