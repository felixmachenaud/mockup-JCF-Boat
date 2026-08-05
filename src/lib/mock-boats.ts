import { DEFAULT_FLEET } from "@/lib/default-fleet";

export type BoatCategory = "standard" | "sans-permis" | "electrique";

export type Boat = {
  id: string;
  name: string;
  year: number;
  type: string;
  category: BoatCategory;
  capacity: number;
  pricePerDay: number;
  priceHalfDay: number;
  location: string;
  rating: number;
  image: string;
  available: boolean;
  tags: string[];
  slotsLeft?: number;
};

/** Compatibilité modales — miroir de la flotte CMS */
export const mockBoats: Boat[] = DEFAULT_FLEET.map((b) => ({
  id: b.id,
  name: b.name,
  year: b.year,
  type: b.type,
  category: b.category,
  capacity: b.capacity,
  pricePerDay: b.pricePerDay,
  priceHalfDay: b.priceHalfDay,
  location: b.location,
  rating: b.rating,
  image: b.image,
  available: b.available,
  tags: b.tags,
}));

export const boatCategories = [
  { id: "all" as const, label: "Tous les bateaux" },
  { id: "standard" as const, label: "Avec permis" },
  { id: "sans-permis" as const, label: "Sans permis" },
  { id: "electrique" as const, label: "Électriques" },
];

export type BoatCategoryFilter = (typeof boatCategories)[number]["id"];

export const boatTypes = ["All", "Day cruiser", "RIB", "Semi-rigide", "Sans permis", "Open", "Sun cruiser", "Coque rigide"] as const;
export type SortOption = "price-asc" | "price-desc" | "capacity" | "rating";

export type BoatSpecs = {
  length: string;
  motor: string;
  license: string;
  features: string[];
};

export function getBoatSpecs(boat: Boat): BoatSpecs {
  const full = DEFAULT_FLEET.find((b) => b.id === boat.id);
  if (full) {
    return {
      length: full.length,
      motor: full.motor,
      license: full.license,
      features: full.features,
    };
  }
  if (boat.category === "sans-permis") {
    return {
      length: "5 – 5,5 m",
      motor: "Électrique ou thermique",
      license: "Sans permis",
      features: ["Facile à piloter", "Briefing inclus"],
    };
  }
  if (boat.category === "electrique") {
    return {
      length: "5 – 7 m",
      motor: "100 % électrique",
      license: boat.type === "Sans permis" ? "Sans permis" : "Permis côtier requis",
      features: ["Zéro émission", "Silencieux"],
    };
  }
  return {
    length: "5 – 7 m",
    motor: "Selon modèle",
    license: "Permis côtier requis",
    features: ["Briefing inclus", "Équipement sécurité"],
  };
}
