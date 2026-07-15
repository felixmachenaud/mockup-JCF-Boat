"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import {
  CalanquesShowcase,
  CassisSubNav,
  CassisWeather,
} from "@/components/cassis-page";
import { CalanquesMap } from "@/components/calanques-map";

type CassisView = "calanques" | "meteo";

function viewFromHash(hash: string): CassisView {
  if (hash === "#meteo") return "meteo";
  return "calanques";
}

export default function CassisPage() {
  const [view, setView] = useState<CassisView>("calanques");

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      setView(viewFromHash(hash));

      if (hash === "#carte-calanques") {
        requestAnimationFrame(() => {
          document.getElementById("carte-calanques")?.scrollIntoView({ behavior: "smooth" });
        });
      }
      if (hash === "#calanques") {
        requestAnimationFrame(() => {
          document.getElementById("calanques")?.scrollIntoView({ behavior: "smooth" });
        });
      }
      if (hash === "#meteo") {
        requestAnimationFrame(() => {
          document.getElementById("meteo")?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const handleTabChange = (tab: CassisView) => {
    setView(tab);
    const hash = tab === "meteo" ? "#meteo" : "#calanques";
    window.history.replaceState(null, "", `/cassis${hash}`);
  };

  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <PageBackground />
      <SiteHeader />

      <div className="relative px-4 pb-4 pt-[calc(5.5rem+env(safe-area-inset-top))] text-center md:pb-8 md:pt-32">
        <Link
          href="/"
          className="mb-5 inline-flex min-h-11 items-center text-sm text-white/60 transition-colors active:text-white hover:text-white"
        >
          ← Retour à l&apos;accueil
        </Link>
        <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
          Cassis
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Perle des Calanques
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
          Découvrez les plus beaux spots entre mer et falaises, puis prenez le large avec JCF Boat.
        </p>
      </div>

      <CassisSubNav active={view} onChange={handleTabChange} />

      <div id="calanques">
        {view === "meteo" ? (
          <div id="meteo">
            <CassisWeather />
          </div>
        ) : (
          <CalanquesShowcase />
        )}
      </div>

      <CalanquesMap />
      <MobileNav />
    </main>
  );
}
