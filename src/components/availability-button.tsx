"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type AvailabilityButtonProps = {
  href?: string;
  label?: string;
  size?: "default" | "hero";
  className?: string;
};

export function AvailabilityButton({
  href = "/bateaux",
  label = "Voir les bateaux",
  size = "default",
  className,
}: AvailabilityButtonProps) {
  const isHero = size === "hero";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors active:scale-[0.98]",
        isHero
          ? "hero-availability-btn group relative min-h-[3.75rem] overflow-hidden bg-white px-12 md:min-h-[4.5rem] md:px-14"
          : "min-h-10 bg-sky-500 px-6 text-white hover:bg-sky-400 md:min-h-11 md:px-7",
        className,
      )}
    >
      <span
        className={cn(
          "text-center leading-tight",
          isHero
            ? "hero-availability-text relative z-10 max-w-[16rem] text-xl transition-transform duration-300 group-hover:scale-[1.02] md:max-w-none md:text-2xl lg:text-[1.75rem]"
            : "max-w-[11rem] text-sm md:max-w-none md:text-base",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
