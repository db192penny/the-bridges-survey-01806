export interface VendorCategory {
  id: string;
  title: string;
  description: string;
  vendors: string[];
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  {
    id: "pool_service",
    title: "Pool Service",
    description: "Who keeps your pool sparkling?",
    vendors: [
      "EZ Pool (Victor Santos)",
      "Swim Time Pools",
      "Progressive Pools (Sam Santana)",
      "Barefoot Pools",
    ],
  },
  {
    id: "hvac",
    title: "HVAC / Air Conditioning",
    description: "Who keeps you cool in summer?",
    vendors: [
      "Cousins Air",
      "Direct Cooling",
      "Ocean Air (Joe)",
      "M&R",
    ],
  },
  {
    id: "landscaping",
    title: "Landscaping / Lawn Care",
    description: "Who maintains your yard?",
    vendors: [
      "Felix Alverez Landscape",
      "Tropical Earth Landscaping, INC.",
      "Boca Raton landscape (Chris)",
      "Annabella Chacon Landscaping",
    ],
  },
  {
    id: "pest_control",
    title: "Pest Control",
    description: "Who keeps the bugs away?",
    vendors: [
      "Fear Not Pest Control (Cicero Moreira)",
      "Hometown Pest Control",
      "Bug Man (Howie)",
      "Bug Thugs",
    ],
  },
  {
    id: "electrician",
    title: "Electrician",
    description: "Who handles your electrical work?",
    vendors: [
      "Alien electrical (Rafael Jaquetti)",
      "Razorback",
      "Caner Electric",
      "Devine Electric (James)",
    ],
  },
  {
    id: "plumber",
    title: "Plumber",
    description: "Who fixes your plumbing?",
    vendors: [
      "Ward Plumbing",
      "Masterclass plumbing (Trevor)",
      "Sharp plumbing (Rob)",
      "Team Plumbing",
    ],
  },
  {
    id: "handyman",
    title: "Handyman",
    description: "Who does your home repairs?",
    vendors: [
      "HM22 General Services (Hugo Blanco)",
      "Tim Bradford (Individual)",
      "Charles Harris (Individual)",
      "Paul Tarantola (Individual)",
    ],
  },
];

export const ADDITIONAL_CATEGORIES = [
  "Painting/Painters",
  "Appliance Repair",
  "Pressure Washing",
  "Carpet Cleaning",
  "Mobile Car Wash",
  "Grill Cleaning",
  "Damage Assessment / Restoration",
  "Generator Companies",
  "Home Theater / AV",
  "Flooring Installation",
  "Pavers",
  "Moving Company",
  "Caterers",
];

export interface CategoryResponse {
  vendors: string[];
  skipped: boolean;
  skip_reason: "dont_use" | "skip_for_now" | null;
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  contact: string;
  contactMethod: "email" | "phone";
  responses: Record<string, CategoryResponse>;
  additional_categories_requested: string[];
  additional_vendors: Record<string, string[]>;
}
