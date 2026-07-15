export type Calanque = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  images: string[];
  highlight: string;
  lat: number;
  lng: number;
  mapsUrl: string;
};

export const calanques: Calanque[] = [
  {
    id: "port-miou",
    name: "Port Miou",
    subtitle: "La plus vaste calanque de Cassis",
    description:
      "Un fjord méditerranéen aux eaux profondes et turquoise. Idéal pour une première approche des calanques en bateau.",
    images: [
      "/calanque1.jpg",
      "/calanque1.2.jpg",
      "/calanque1.3.jpg",
      "/calanque1.4.jpg",
    ],
    highlight: "Accès facile · Eaux calmes le matin",
    lat: 43.2105,
    lng: 5.5217,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calanque+de+Port-Miou+Cassis",
  },
  {
    id: "port-pin",
    name: "Port Pin",
    subtitle: "Le pin parasol emblématique",
    description:
      "Une calanque étroite et préservée, célèbre pour son pin penché au-dessus de l'eau cristalline.",
    images: [
      "/calanque2.1.jpg",
      "/calanque2.2.jpg",
      "/calanque2.3.jpg",
      "/calanque2.4.jpg",
    ],
    highlight: "Baignade · Photos iconiques",
    lat: 43.2136,
    lng: 5.509,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calanque+de+Port-Pin+Cassis",
  },
  {
    id: "en-vau",
    name: "En Vau",
    subtitle: "Le joyau des calanques",
    description:
      "Falaises vertigineuses, eau vert émeraude et plage de galets. L'escale la plus spectaculaire de la côte.",
    images: ["/calanque3.1.jpg", "/calanque3.2.jpg", "/calanque3.3.jpg"],
    highlight: "Incontournable · Vue panoramique",
    lat: 43.2036,
    lng: 5.499,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calanque+d'En-Vau+Cassis",
  },
  {
    id: "sormiou",
    name: "Sormiou",
    subtitle: "La calanque marseillaise la plus proche",
    description:
      "Grandiose anse protégée entre falaises blanches et eaux turquoise. Un must pour une escapade bateau depuis Cassis.",
    images: ["/calanque4.1.jpg", "/calanque4.2.jpg", "/calanque4.3.jpg"],
    highlight: "Pêche · Paysages grandioses",
    lat: 43.2103,
    lng: 5.4194,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calanque+de+Sormiou+Marseille",
  },
];

export const calanquesMapCenter = { lat: 43.209, lng: 5.478 };
