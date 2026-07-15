"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CassisExpandNav } from "@/components/cassis-expand-nav";
import { MobileMenuSheet } from "@/components/mobile-menu-sheet";

const headerPillClass =
  "rounded-full border border-white/30 bg-black/55 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl";

const linkClass =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-4 md:text-sm";

const centerLinks = [
  { href: "/#team", label: "Notre équipe" },
  { href: "/#fleet", label: "Les bateaux" },
  { href: "/#fleet", label: "Réserver", highlight: true },
  { href: "/#reviews", label: "Avis" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:top-5 md:pt-0">
      {/* Mobile — barre compacte pleine largeur */}
      <div
        className={cn(
          headerPillClass,
          "pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 px-2 py-1.5 md:hidden"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors active:bg-white/10",
            isHome ? "text-white" : "text-white/85"
          )}
        >
          Accueil
        </Link>

        <Link
          href="/#fleet"
          scroll
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 transition-transform active:scale-[0.98]"
        >
          Réserver
        </Link>

        <MobileMenuSheet />
      </div>

      {/* Desktop — navigation complète */}
      <div className="pointer-events-auto hidden items-center md:flex">
        <nav
          aria-label="Accueil"
          className={cn(
            headerPillClass,
            "pointer-events-auto inline-flex min-w-[6.75rem] items-center justify-center px-2 py-1.5 md:px-3 md:py-2"
          )}
          style={{ marginRight: "0.4cm" }}
        >
          <Link href="/" className={cn(linkClass, isHome && "text-white")}>
            Accueil
          </Link>
        </nav>

        <nav
          aria-label="Navigation principale"
          className={cn(
            headerPillClass,
            "flex items-center gap-0.5 px-2 py-1.5 md:gap-1 md:px-4 md:py-2"
          )}
        >
          {centerLinks.map(({ href, label, highlight }) => (
            <Link
              key={label}
              href={href}
              scroll
              className={cn(
                linkClass,
                highlight &&
                  "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <CassisExpandNav />
      </div>
    </header>
  );
}
