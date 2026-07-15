"use client";

import { LogoScrollAnimation } from "@/components/ui/logo-scroll-animation";
import { ChevronDown } from "lucide-react";

export function HeroScroll() {
  return (
    <section id="hero" className="relative scroll-mt-0">
      <LogoScrollAnimation />

      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex justify-center md:bottom-8">
        <a
          href="#fleet"
          className="pointer-events-auto flex min-h-11 flex-col items-center justify-center gap-1 rounded-full px-4 py-2 text-sm text-white/60 transition-colors active:bg-white/10 active:text-white"
        >
          <span>Découvrir</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
