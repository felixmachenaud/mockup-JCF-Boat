import type { BoatCategory, CmsBoat } from "@/lib/site-content";

/** Permis — filtre principal + sous-filtre Électriques */
export type BoatLicenseKind = "avec-permis" | "sans-permis";

/** Coque — sous-filtre « Avec permis » */
export type BoatHullKind = "rigide" | "semi-rigide" | "autre";

export const BOAT_LICENSE_OPTIONS: {
  value: BoatLicenseKind;
  label: string;
  licenseLabel: string;
}[] = [
  {
    value: "avec-permis",
    label: "Avec permis",
    licenseLabel: "Permis côtier requis",
  },
  {
    value: "sans-permis",
    label: "Sans permis",
    licenseLabel: "Sans permis",
  },
];

export const BOAT_PROPULSION_OPTIONS: {
  value: "thermique" | "electrique";
  label: string;
}[] = [
  { value: "thermique", label: "Thermique" },
  { value: "electrique", label: "Électrique" },
];

/** Valeurs exactes stockées dans `boat.type` (filtres + fiches) */
export const BOAT_HULL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "Coque rigide", label: "Rigide (coque rigide)" },
  { value: "Semi-rigide", label: "Semi-rigide" },
  { value: "Open", label: "Open" },
  { value: "Sun cruiser", label: "Sun cruiser" },
  { value: "Sans permis", label: "Sans permis" },
];

export function isSansPermis(boat: Pick<CmsBoat, "category" | "license" | "type">) {
  return (
    boat.category === "sans-permis" ||
    /sans\s*permis/i.test(boat.license) ||
    /sans\s*permis/i.test(boat.type)
  );
}

export function isElectric(boat: Pick<CmsBoat, "category" | "motor">) {
  return boat.category === "electrique" || /électri/i.test(boat.motor);
}

export function getLicenseKind(
  boat: Pick<CmsBoat, "category" | "license" | "type">,
): BoatLicenseKind {
  return isSansPermis(boat) ? "sans-permis" : "avec-permis";
}

export function getHullKind(boat: Pick<CmsBoat, "type">): BoatHullKind {
  if (/semi[- ]?rigide/i.test(boat.type)) return "semi-rigide";
  if (
    /coque\s*rigide/i.test(boat.type) ||
    /^open$/i.test(boat.type) ||
    /sun\s*cruiser/i.test(boat.type)
  ) {
    return "rigide";
  }
  return "autre";
}

export function matchesHullFilter(
  boat: Pick<CmsBoat, "type" | "category" | "motor">,
  hull: "all" | "rigides" | "semi-rigides" | "electriques",
) {
  if (hull === "all") return true;
  if (hull === "electriques") return isElectric(boat);
  if (hull === "semi-rigides") return getHullKind(boat) === "semi-rigide";
  return getHullKind(boat) === "rigide" && !isElectric(boat);
}

/** `category` CMS dérivée (rétro-compatible avec l’existant) */
export function deriveBoatCategory(
  license: BoatLicenseKind,
  electric: boolean,
): BoatCategory {
  if (electric) return "electrique";
  if (license === "sans-permis") return "sans-permis";
  return "standard";
}

export function applyBoatClassification(
  boat: CmsBoat,
  patch: {
    licenseKind?: BoatLicenseKind;
    electric?: boolean;
    hullType?: string;
  },
): CmsBoat {
  const licenseKind = patch.licenseKind ?? getLicenseKind(boat);
  const electric = patch.electric ?? isElectric(boat);
  const hullType = patch.hullType ?? boat.type;
  const licenseMeta = BOAT_LICENSE_OPTIONS.find((o) => o.value === licenseKind)!;

  let motor = boat.motor;
  if (electric && !/électri/i.test(motor)) {
    motor = motor.trim() ? `${motor} · 100 % électrique` : "100 % électrique";
  }
  if (!electric && /100\s*%\s*électri/i.test(motor) && !motor.includes("·")) {
    motor = motor.replace(/\s*100\s*%\s*électri[^·]*/gi, "").trim();
  }

  return {
    ...boat,
    type: hullType,
    license: licenseMeta.licenseLabel,
    category: deriveBoatCategory(licenseKind, electric),
    motor,
  };
}

export function boatClassificationSummary(boat: CmsBoat) {
  const parts = [
    getLicenseKind(boat) === "sans-permis" ? "Sans permis" : "Avec permis",
    isElectric(boat) ? "Électrique" : null,
    boat.type,
  ].filter(Boolean);
  return parts.join(" · ");
}
