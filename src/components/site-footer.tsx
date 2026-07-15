import Link from "next/link";

const partnerLinks = [
  { href: "#", label: "Nos partenaires" },
  { href: "#", label: "Guide de Provence" },
  { href: "https://www.cassis.com", label: "Ville de Cassis" },
  { href: "#", label: "Séminaires" },
  { href: "#", label: "Locations professionnelles" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-auto border-t border-white/10">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-black/70 backdrop-blur-[48px] backdrop-saturate-150"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <nav
            aria-label="Liens partenaires"
            className="flex flex-wrap justify-center gap-2 md:gap-3"
          >
            {partnerLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="min-h-11 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/85 transition-colors active:scale-[0.98] hover:border-white/35 hover:bg-white/10 hover:text-white md:text-sm"
              >
                {label}
              </Link>
            ))}
          </nav>

          <blockquote className="mx-auto mt-10 max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-white/90 md:text-base md:leading-relaxed">
              Les Calanques situées entre Marseille et Cassis constituent un univers de
              criques spectaculaires, dominées par d&apos;imposantes falaises calcaires
              tombant à pic dans une mer bleu profond.
            </p>
            <footer className="mt-4 text-sm font-medium tracking-wide text-white/60">
              Jean Cocteau
            </footer>
          </blockquote>

          <div className="mt-10 border-t border-white/10 pt-8 text-center">
            <p className="text-sm font-semibold text-white">JCF Boat Services</p>
            <p className="mt-1 text-xs text-white/55">Cassis · 06 75 74 25 81</p>
            <p className="mt-3 text-[11px] text-white/40">
              © {new Date().getFullYear()} Website Studio. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
