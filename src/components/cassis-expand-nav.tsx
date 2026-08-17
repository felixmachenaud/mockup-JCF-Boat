"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const headerPillClass =
  "rounded-full border border-white/30 bg-black/55 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl";

const linkClass =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-4 md:text-sm";

const activeLinkClass = "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25";

const navShellClass = cn(
  headerPillClass,
  "inline-flex min-w-[6.75rem] items-center justify-center px-2 py-1.5 md:px-3 md:py-2",
);

const cassisLinks = [
  { href: "/calanques-de-cassis", label: "Calanques" },
  { href: "/location-bateau-cassis", label: "Location" },
];

export function CassisExpandNav() {
  const pathname = usePathname();
  const isCassisSection =
    pathname.startsWith("/calanques-de-cassis") ||
    pathname.startsWith("/location-bateau-cassis");
  const [userOpen, setUserOpen] = useState(false);
  const open = isCassisSection || userOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (!isCassisSection) setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isCassisSection]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    if (!mq.matches) return;

    const node = ref.current;
    if (!node) return;

    const openMenu = () => setUserOpen(true);
    const closeMenu = () => {
      if (!isCassisSection) setUserOpen(false);
    };
    node.addEventListener("mouseenter", openMenu);
    node.addEventListener("mouseleave", closeMenu);
    return () => {
      node.removeEventListener("mouseenter", openMenu);
      node.removeEventListener("mouseleave", closeMenu);
    };
  }, [isCassisSection]);

  return (
    <div
      ref={ref}
      className="relative shrink-0"
      style={{ marginLeft: "0.4cm" }}
    >
      <nav aria-hidden className={cn(navShellClass, "pointer-events-none invisible")}>
        <span className={linkClass}>Cassis</span>
      </nav>

      <nav
        aria-label="Cassis"
        className={cn(
          navShellClass,
          "absolute left-0 top-0 z-40 justify-start whitespace-nowrap transition-shadow duration-300",
          open && "shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
        )}
      >
        <Link
          href="/calanques-de-cassis"
          className={cn(linkClass, "shrink-0", isCassisSection && activeLinkClass)}
          aria-current={isCassisSection ? "page" : undefined}
        >
          Cassis
        </Link>

        <div
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300 ease-out",
            open ? "max-w-[280px] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          {cassisLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setUserOpen(true)}
                className={cn(linkClass, "shrink-0", active && activeLinkClass)}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
