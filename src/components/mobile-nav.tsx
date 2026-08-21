"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Ship, MapPin, Star, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Anchor, label: "Accueil", href: "/", match: (p: string) => p === "/" },
  {
    icon: Ship,
    label: "Bateaux",
    href: "/bateaux",
    match: (p: string) => p.startsWith("/bateaux"),
  },
  {
    icon: MapPin,
    label: "Calanques",
    href: "/calanques-de-cassis",
    match: (p: string) =>
      p.startsWith("/calanques-de-cassis") || p.startsWith("/location-bateau-cassis"),
  },
  { icon: Star, label: "Avis", href: "/#reviews", match: () => false },
  { icon: Phone, label: "Contact", href: "/#contact", match: () => false },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-md justify-center px-4 pb-1.5">
        <div className="flex w-full items-center justify-around gap-0.5 rounded-[1.35rem] border border-white/25 bg-black/70 px-1.5 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          {navItems.map(({ icon: Icon, label, href, match }) => {
            const isActive = match(pathname);

            return (
              <Link
                key={label}
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:scale-95",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/65 active:bg-white/10 active:text-white"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive && "text-sky-300")} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
