import type { BoatCategory } from "@/lib/mock-boats";

export type ReviewCategory = "all" | BoatCategory;

export type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  category: Exclude<ReviewCategory, "all">;
  date: string;
};

export const mockReviews: Review[] = [
  // Avec permis
  {
    id: "r1",
    name: "Sophie M.",
    location: "Lyon",
    rating: 5,
    text: "Journée parfaite dans les calanques. Bateau impeccable, briefing clair et équipe très pro. On reviendra cet été.",
    category: "standard",
    date: "Juillet 2025",
  },
  {
    id: "r4",
    name: "Émilie D.",
    location: "Bruxelles",
    rating: 4,
    text: "Location fluide, bateau très propre. Les conseils d'itinéraire ont fait toute la différence pour les calanques.",
    category: "standard",
    date: "Septembre 2025",
  },
  {
    id: "r5",
    name: "Karim B.",
    location: "Nice",
    rating: 5,
    text: "Parfait pour un enterrement de vie de garçon : RIB sportif, équipe réactive et accueil simple sur place.",
    category: "standard",
    date: "Mai 2025",
  },
  {
    id: "r8",
    name: "Nadia P.",
    location: "Toulon",
    rating: 4,
    text: "Très belle flotte, prix transparents. L'équipe nous a très bien accueillis sur place.",
    category: "standard",
    date: "Juin 2025",
  },
  {
    id: "r9",
    name: "Laurent G.",
    location: "Montpellier",
    rating: 5,
    text: "MANA 23 nickel, moteur souple et consommation raisonnable. L'équipe nous a conseillé Port-Miou puis En-Vau — magique.",
    category: "standard",
    date: "Août 2025",
  },
  {
    id: "r10",
    name: "Isabelle & Paul",
    location: "Strasbourg",
    rating: 5,
    text: "Première location avec permis côtier : briefing rassurant, bateau facile à manœuvrer. Une journée inoubliable en famille.",
    category: "standard",
    date: "Juillet 2025",
  },

  // Sans permis
  {
    id: "r2",
    name: "Marc & Julie",
    location: "Paris",
    rating: 5,
    text: "Sans permis et zéro stress : en 20 minutes on était en mer. Idéal pour une première sortie en famille.",
    category: "sans-permis",
    date: "Août 2025",
  },
  {
    id: "r6",
    name: "Claire V.",
    location: "Aix-en-Provence",
    rating: 5,
    text: "Notre sortie sans permis était top. Accueil chaleureux et mer calme le matin — parfait avec les enfants.",
    category: "sans-permis",
    date: "Juillet 2025",
  },
  {
    id: "r11",
    name: "Hugo T.",
    location: "Marseille",
    rating: 5,
    text: "On a pris un bateau sans permis pour découvrir Cassis autrement. Simple, fun et l'équipe reste joignable par téléphone.",
    category: "sans-permis",
    date: "Juin 2025",
  },
  {
    id: "r12",
    name: "Sandrine L.",
    location: "Avignon",
    rating: 4,
    text: "Parfait pour un couple sans expérience nautique. Explications claires et itinéraire facile le long de la côte.",
    category: "sans-permis",
    date: "Septembre 2025",
  },
  {
    id: "r13",
    name: "Famille Renard",
    location: "Lille",
    rating: 5,
    text: "Avec trois ados, le sans permis était le bon choix. Bateau confortable, pique-nique à bord et eau cristalline.",
    category: "sans-permis",
    date: "Août 2025",
  },

  // Électriques
  {
    id: "r3",
    name: "Thomas R.",
    location: "Marseille",
    rating: 5,
    text: "Le bateau électrique est une révélation : silence, confort et vue incroyable sur Cassis. Expérience premium.",
    category: "electrique",
    date: "Juin 2025",
  },
  {
    id: "r7",
    name: "Antoine L.",
    location: "Genève",
    rating: 5,
    text: "Bateau électrique silencieux, autonomie suffisante pour la journée. Service haut de gamme, je recommande.",
    category: "electrique",
    date: "Août 2025",
  },
  {
    id: "r14",
    name: "Camille B.",
    location: "Paris",
    rating: 5,
    text: "Expérience ultra zen : pas de bruit moteur, juste la mer. Parfait pour une sortie romantique au lever du soleil.",
    category: "electrique",
    date: "Juillet 2025",
  },
  {
    id: "r15",
    name: "David & Nora",
    location: "Bordeaux",
    rating: 4,
    text: "Nous avions des doutes sur l'autonomie — aucun souci pour la demi-journée. Équipe très professionnelle à l'accueil.",
    category: "electrique",
    date: "Mai 2025",
  },
  {
    id: "r16",
    name: "Élodie F.",
    location: "Cannes",
    rating: 5,
    text: "Le silence du 100 % électrique change tout dans les calanques. Luxe discret, zéro odeur de carburant. On adore.",
    category: "electrique",
    date: "Septembre 2025",
  },
];

export const reviewCategories = [
  { id: "all" as const, label: "Tous les avis" },
  { id: "standard" as const, label: "Avec permis" },
  { id: "sans-permis" as const, label: "Sans permis" },
  { id: "electrique" as const, label: "Électriques" },
];

export const reviewCategoryLabels: Record<
  Exclude<ReviewCategory, "all">,
  string
> = {
  standard: "Avec permis",
  "sans-permis": "Sans permis",
  electrique: "Électrique",
};
