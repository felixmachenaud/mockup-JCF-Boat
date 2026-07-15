"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/#team", label: "Notre équipe" },
  { href: "/#fleet", label: "Les bateaux" },
  { href: "/#fleet", label: "Réserver", highlight: true },
  { href: "/#reviews", label: "Avis clients" },
  { href: "/#contact", label: "Contact" },
];

const cassisLinks = [
  { href: "/cassis#calanques", label: "Les calanques" },
  { href: "/cassis#carte-calanques", label: "Carte interactive" },
  { href: "/cassis#meteo", label: "Météo à Cassis" },
];

export function MobileMenuSheet() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white active:bg-white/15"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:inline">Menu</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[85dvh] overflow-y-auto rounded-t-[1.75rem] border-white/10 bg-slate-950/95 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-6 text-white backdrop-blur-2xl md:hidden [&>button]:text-white/70 [&>button]:hover:text-white"
      >
        <SheetHeader className="mb-6 pr-8">
          <SheetTitle className="text-left text-xl font-semibold text-white">
            Navigation
          </SheetTitle>
          <p className="text-left text-sm text-white/55">
            JCF Boat Services · Cassis
          </p>
        </SheetHeader>

        <nav aria-label="Menu principal" className="space-y-1">
          {mainLinks.map(({ href, label, highlight }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname === "/" && href.startsWith("/#");

            return (
              <SheetClose asChild key={label}>
                <Link
                  href={href}
                  scroll
                  className={cn(
                    "flex min-h-12 items-center rounded-2xl px-4 text-base font-medium transition-colors active:scale-[0.98]",
                    highlight
                      ? "bg-sky-500 text-white"
                      : "text-white/90 hover:bg-white/10 active:bg-white/15",
                    isActive && !highlight && "bg-white/10"
                  )}
                >
                  {label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="my-5 h-px bg-white/10" />

        <p className="mb-2 px-4 text-xs font-medium tracking-[0.2em] text-sky-300 uppercase">
          Cassis
        </p>
        <nav aria-label="Cassis" className="space-y-1">
          <SheetClose asChild>
            <Link
              href="/cassis"
              className={cn(
                "flex min-h-12 items-center rounded-2xl px-4 text-base font-medium transition-colors",
                pathname === "/cassis"
                  ? "bg-white/10 text-white"
                  : "text-white/90 hover:bg-white/10 active:bg-white/15"
              )}
            >
              Découvrir Cassis
            </Link>
          </SheetClose>
          {cassisLinks.map(({ href, label }) => (
            <SheetClose asChild key={label}>
              <Link
                href={href}
                className="flex min-h-11 items-center rounded-2xl px-4 pl-6 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white active:bg-white/15"
              >
                {label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-6">
          <SheetClose asChild>
            <a
              href="tel:0675742581"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-slate-900 transition-transform active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
              06 75 74 25 81
            </a>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
