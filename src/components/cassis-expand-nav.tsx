"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const headerPillClass =
  "rounded-full border border-white/30 bg-black/55 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl";

const linkClass =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-4 md:text-sm";

const navShellClass = cn(
  headerPillClass,
  "inline-flex min-w-[6.75rem] items-center justify-center px-2 py-1.5 md:px-3 md:py-2"
);

const cassisLinks = [
  { href: "/cassis#calanques", label: "Calanques" },
  { href: "/cassis#carte-calanques", label: "Carte" },
  { href: "/cassis#meteo", label: "Météo" },
];

export function CassisExpandNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    if (!mq.matches) return;

    const node = ref.current;
    if (!node) return;

    const openMenu = () => setOpen(true);
    const closeMenu = () => setOpen(false);
    node.addEventListener("mouseenter", openMenu);
    node.addEventListener("mouseleave", closeMenu);
    return () => {
      node.removeEventListener("mouseenter", openMenu);
      node.removeEventListener("mouseleave", closeMenu);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative shrink-0"
      style={{ marginLeft: "0.4cm" }}
    >
      {/* Placeholder invisible : même gabarit qu'Accueil pour l'alignement vertical */}
      <nav aria-hidden className={cn(navShellClass, "pointer-events-none invisible")}>
        <span className={linkClass}>Cassis</span>
      </nav>

      <nav
        aria-label="Cassis"
        className={cn(
          navShellClass,
          "absolute left-0 top-0 z-40 justify-start whitespace-nowrap transition-shadow duration-300",
          open && "shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(linkClass, "shrink-0")}
          aria-expanded={open}
          aria-haspopup="true"
        >
          Cassis
        </button>

        <div
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300 ease-out",
            open ? "max-w-[240px] opacity-100" : "max-w-0 opacity-0"
          )}
        >
          {cassisLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(linkClass, "shrink-0")}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
