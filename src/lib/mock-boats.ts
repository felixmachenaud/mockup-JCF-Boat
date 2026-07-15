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

export const mockBoats: Boat[] = [
  {
    id: "1",
    name: "Cap Camarat 7.5",
    year: 2022,
    type: "Day cruiser",
    category: "standard",
    capacity: 8,
    pricePerDay: 650,
    priceHalfDay: 420,
    location: "Cassis",
    rating: 4.9,
    image: "/bateau1.jpg",
    available: true,
    tags: ["Premium", "Famille"],
    slotsLeft: 2,
  },
  {
    id: "2",
    name: "Zodiac Medline 580",
    year: 2021,
    type: "RIB",
    category: "standard",
    capacity: 10,
    pricePerDay: 480,
    priceHalfDay: 310,
    location: "Cassis",
    rating: 4.8,
    image: "/bateau2.jpg",
    available: true,
    tags: ["Sport", "Calanques"],
    slotsLeft: 3,
  },
  {
    id: "4",
    name: "Bénéteau Flyer 6 SUNdeck",
    year: 2020,
    type: "Day cruiser",
    category: "standard",
    capacity: 6,
    pricePerDay: 520,
    priceHalfDay: 340,
    location: "Cassis",
    rating: 4.7,
    image: "/bateau4.jpg",
    available: true,
    tags: ["Couple", "Demi-journée"],
  },
  {
    id: "6",
    name: "Zodiac Pro Open 550",
    year: 2022,
    type: "RIB",
    category: "standard",
    capacity: 8,
    pricePerDay: 420,
    priceHalfDay: 280,
    location: "Cassis",
    rating: 4.8,
    image: "/bateau6.png",
    available: true,
    tags: ["Aventure"],
    slotsLeft: 2,
  },
  {
    id: "7",
    name: "Sea Ray 250 SLX",
    year: 2018,
    type: "Day cruiser",
    category: "standard",
    capacity: 8,
    pricePerDay: 750,
    priceHalfDay: 490,
    location: "Cassis",
    rating: 4.8,
    image: "/bateau7.png",
    available: false,
    tags: ["Premium"],
  },
  {
    id: "8",
    name: "BWA Sport 26",
    year: 2021,
    type: "RIB",
    category: "standard",
    capacity: 12,
    pricePerDay: 580,
    priceHalfDay: 380,
    location: "Cassis",
    rating: 4.9,
    image: "/bateau8.jpg",
    available: true,
    tags: ["Groupe"],
    slotsLeft: 1,
  },
  {
    id: "sp1",
    name: "Quicksilver 455 Open",
    year: 2023,
    type: "Sans permis",
    category: "sans-permis",
    capacity: 5,
    pricePerDay: 290,
    priceHalfDay: 190,
    location: "Cassis",
    rating: 4.9,
    image: "/sans_permis1.jpg",
    available: true,
    tags: ["Sans permis", "Facile"],
    slotsLeft: 4,
  },
  {
    id: "sp2",
    name: "Jeanneau Merry Fisher 605",
    year: 2022,
    type: "Sans permis",
    category: "sans-permis",
    capacity: 6,
    pricePerDay: 340,
    priceHalfDay: 220,
    location: "Cassis",
    rating: 4.8,
    image: "/sans_permis2.jpg",
    available: true,
    tags: ["Sans permis", "Confort"],
  },
  {
    id: "sp3",
    name: "Bénéteau Antares 6",
    year: 2021,
    type: "Sans permis",
    category: "sans-permis",
    capacity: 7,
    pricePerDay: 360,
    priceHalfDay: 240,
    location: "Cassis",
    rating: 4.7,
    image: "/sans_permis3.png",
    available: true,
    tags: ["Sans permis", "Famille"],
    slotsLeft: 2,
  },
  {
    id: "el1",
    name: "Rand Escape 30",
    year: 2024,
    type: "Électrique",
    category: "electrique",
    capacity: 8,
    pricePerDay: 520,
    priceHalfDay: 350,
    location: "Cassis",
    rating: 5.0,
    image: "/electrique1.jpg",
    available: true,
    tags: ["Électrique", "Éco"],
    slotsLeft: 2,
  },
  {
    id: "el2",
    name: "X Shore 1",
    year: 2023,
    type: "Électrique",
    category: "electrique",
    capacity: 6,
    pricePerDay: 680,
    priceHalfDay: 450,
    location: "Cassis",
    rating: 4.9,
    image: "/electrique2.png",
    available: true,
    tags: ["Électrique", "Premium"],
    slotsLeft: 1,
  },
  {
    id: "el3",
    name: "Greenline 39",
    year: 2022,
    type: "Électrique",
    category: "electrique",
    capacity: 10,
    pricePerDay: 790,
    priceHalfDay: 520,
    location: "Cassis",
    rating: 4.8,
    image: "/electrique3.jpg",
    available: true,
    tags: ["Électrique", "Luxe"],
  },
];

export const boatCategories = [
  { id: "all" as const, label: "Tous les bateaux" },
  { id: "standard" as const, label: "Avec permis" },
  { id: "sans-permis" as const, label: "Sans permis" },
  { id: "electrique" as const, label: "Électriques" },
];

export type BoatCategoryFilter = (typeof boatCategories)[number]["id"];

export const boatTypes = ["All", "Day cruiser", "RIB"] as const;
export type SortOption = "price-asc" | "price-desc" | "capacity" | "rating";

export type BoatSpecs = {
  length: string;
  motor: string;
  license: string;
  features: string[];
};

export function getBoatSpecs(boat: Boat): BoatSpecs {
  if (boat.category === "sans-permis") {
    return {
      length: "5,5 à 6 m",
      motor: "40–70 CV",
      license: "Sans permis",
      features: ["Facile à piloter", "Briefing inclus", "Idéal débutants", "GPS & sondeur"],
    };
  }
  if (boat.category === "electrique") {
    return {
      length: "6 à 9 m",
      motor: "100 % électrique",
      license: boat.type === "Sans permis" ? "Sans permis" : "Permis côtier",
      features: ["Zéro émission", "Silencieux", "Autonomie journée", "Batterie lithium"],
    };
  }
  return {
    length: boat.type === "RIB" ? "5,5–7 m" : "6–9 m",
    motor: boat.type === "RIB" ? "115–200 CV" : "150–250 CV",
    license: "Permis côtier requis",
    features: ["Bimini", "Glacière", "Douche de pont", "Équipement sécurité CE"],
  };
}
