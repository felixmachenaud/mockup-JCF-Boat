"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CmsCalanque } from "@/lib/site-content";
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

export function CassisPageClient({
  eyebrow,
  title,
  subtitle,
  calanques,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  calanques: CmsCalanque[];
}) {
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
        <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-white/50">
          <Link href="/" className="hover:text-white">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/80">Cassis</span>
        </nav>
        <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
          {subtitle}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-white/55">
          Pour y aller en mer, découvrez notre{" "}
          <Link
            href="/location-bateau-cassis"
            className="text-sky-300 underline-offset-2 hover:underline"
          >
            location de bateau à Cassis
          </Link>{" "}
          ou le{" "}
          <Link
            href="/visite-calanques-en-bateau"
            className="text-sky-300 underline-offset-2 hover:underline"
          >
            guide de visite des calanques
          </Link>
          .
        </p>
      </div>

      <CassisSubNav active={view} onChange={handleTabChange} />

      <div id="calanques">
        {view === "meteo" ? (
          <div id="meteo">
            <CassisWeather />
          </div>
        ) : (
          <CalanquesShowcase calanques={calanques} />
        )}
      </div>

      <CalanquesMap calanques={calanques} />
      <MobileNav />
    </main>
  );
}
