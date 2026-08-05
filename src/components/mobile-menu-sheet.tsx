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
  { href: "/#bateaux", label: "Les bateaux", highlight: true },
  { href: "/bateaux", label: "Catalogue complet" },
  { href: "/#destinations", label: "Destinations" },
  { href: "/location-bateau-cassis", label: "Location bateau Cassis" },
  { href: "/calanques-de-cassis", label: "Calanques de Cassis" },
  { href: "/#team", label: "Notre équipe" },
  { href: "/#reviews", label: "Avis clients" },
  { href: "/#contact", label: "Contact" },
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
              href === pathname ||
              (href.startsWith("/") && !href.includes("#") && pathname === href);

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
                    isActive && !highlight && "bg-white/10",
                  )}
                >
                  {label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <SheetClose asChild>
          <a
            href="tel:0675742581"
            className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4" />
            06 75 74 25 81
          </a>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
