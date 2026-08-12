"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CmsBoat } from "@/lib/site-content";
import {
  isElectric,
  isSansPermis,
  matchesHullFilter,
} from "@/lib/boat-taxonomy";
import { cn } from "@/lib/utils";
import { BoatCard } from "@/components/boat-card";

type PrimaryTab = "all" | "avec-permis" | "sans-permis" | "electriques";
type HullTab = "all" | "rigides" | "semi-rigides" | "electriques";
type ElectricLicenseTab = "all" | "avec-permis" | "sans-permis";

const PRIMARY_TABS: { id: PrimaryTab; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "avec-permis", label: "Avec permis" },
  { id: "sans-permis", label: "Sans permis" },
  { id: "electriques", label: "Électriques" },
];

const HULL_TABS: { id: HullTab; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "rigides", label: "Rigides" },
  { id: "semi-rigides", label: "Semi-Rigides" },
  { id: "electriques", label: "Électriques" },
];

const ELECTRIC_LICENSE_TABS: { id: ElectricLicenseTab; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "avec-permis", label: "Avec permis" },
  { id: "sans-permis", label: "Sans permis" },
];

const BANNER_CLASS =
  "rounded-3xl border border-sky-300/35 bg-sky-500/25 p-1.5 shadow-[0_12px_40px_rgba(14,165,233,0.12)] backdrop-blur-md";

const TAB_BASE =
  "min-h-11 flex-1 rounded-2xl px-4 py-2.5 text-center text-sm font-bold text-white transition-colors active:scale-[0.98] sm:flex-none md:text-base";

function FilterBanner({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={BANNER_CLASS} role="tablist" aria-label={label}>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {children}
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        TAB_BASE,
        active ? "bg-white/25 shadow-sm" : "hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

type BoatFleetFiltersProps = {
  boats: CmsBoat[];
};

export function BoatFleetFilters({ boats }: BoatFleetFiltersProps) {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("all");
  const [hullTab, setHullTab] = useState<HullTab>("all");
  const [electricLicenseTab, setElectricLicenseTab] =
    useState<ElectricLicenseTab>("all");

  const filtered = useMemo(() => {
    return boats.filter((boat) => {
      const sansPermis = isSansPermis(boat);

      if (primaryTab === "sans-permis") return sansPermis;

      if (primaryTab === "avec-permis") {
        if (sansPermis) return false;
        return matchesHullFilter(boat, hullTab);
      }

      if (primaryTab === "electriques") {
        if (!isElectric(boat)) return false;
        if (electricLicenseTab === "avec-permis") return !sansPermis;
        if (electricLicenseTab === "sans-permis") return sansPermis;
        return true;
      }

      return true;
    });
  }, [boats, primaryTab, hullTab, electricLicenseTab]);

  const handlePrimaryChange = (id: PrimaryTab) => {
    setPrimaryTab(id);
    setHullTab("all");
    setElectricLicenseTab("all");
  };

  return (
    <div>
      <FilterBanner label="Filtrer par catégorie">
        {PRIMARY_TABS.map(({ id, label }) => (
          <FilterTab
            key={id}
            active={primaryTab === id}
            onClick={() => handlePrimaryChange(id)}
          >
            {label}
          </FilterTab>
        ))}
      </FilterBanner>

      <AnimatePresence initial={false}>
        {primaryTab === "avec-permis" ? (
          <motion.div
            key="hull-tabs"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <FilterBanner label="Filtrer par type de coque">
              {HULL_TABS.map(({ id, label }) => (
                <FilterTab
                  key={id}
                  active={hullTab === id}
                  onClick={() => setHullTab(id)}
                >
                  {label}
                </FilterTab>
              ))}
            </FilterBanner>
          </motion.div>
        ) : null}

        {primaryTab === "electriques" ? (
          <motion.div
            key="electric-license-tabs"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <FilterBanner label="Filtrer les électriques par permis">
              {ELECTRIC_LICENSE_TABS.map(({ id, label }) => (
                <FilterTab
                  key={id}
                  active={electricLicenseTab === id}
                  onClick={() => setElectricLicenseTab(id)}
                >
                  {label}
                </FilterTab>
              ))}
            </FilterBanner>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="text-white/60">Aucun bateau dans cette catégorie.</p>
        ) : (
          <motion.div
            key={`${primaryTab}-${hullTab}-${electricLicenseTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
