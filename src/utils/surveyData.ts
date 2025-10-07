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
      "Aqua Blue Pool Service",
      "Crystal Clear Pools",
      "Sunshine Pool Care",
      "Paradise Pool Maintenance",
    ],
  },
  {
    id: "hvac",
    title: "HVAC / Air Conditioning",
    description: "Who keeps you cool in summer?",
    vendors: [
      "Cool Breeze AC & Heating",
      "Precision Air Systems",
      "Climate Control Pros",
      "Arctic Air Solutions",
    ],
  },
  {
    id: "landscaping",
    title: "Landscaping / Lawn Care",
    description: "Who maintains your yard?",
    vendors: [
      "Green Thumb Landscaping",
      "Premier Lawn Service",
      "Tropical Gardens Care",
      "Elite Yard Maintenance",
    ],
  },
  {
    id: "pest_control",
    title: "Pest Control",
    description: "Who keeps the bugs away?",
    vendors: [
      "Guardian Pest Control",
      "Bug-Free Solutions",
      "EcoSafe Pest Services",
      "Shield Pest Management",
    ],
  },
  {
    id: "electrician",
    title: "Electrician",
    description: "Who handles your electrical work?",
    vendors: [
      "Bright Electric Services",
      "PowerUp Electrical",
      "Reliable Electric Pros",
      "Spark Electrical Solutions",
    ],
  },
  {
    id: "plumber",
    title: "Plumber",
    description: "Who fixes your plumbing?",
    vendors: [
      "FastFlow Plumbing",
      "Crystal Plumbing Services",
      "DrainMaster Plumbers",
      "Aqua Works Plumbing",
    ],
  },
  {
    id: "handyman",
    title: "Handyman",
    description: "Who does your home repairs?",
    vendors: [
      "Fix-It Frank Services",
      "HandyPro Solutions",
      "Mr. Fix-It Home Repair",
      "All-Around Handyman",
    ],
  },
  {
    id: "painting",
    title: "Painting / Painters",
    description: "Who handles your painting projects?",
    vendors: [
      "Premier Painting Pros",
      "ColorPerfect Painters",
      "Elite Paint Services",
      "Brushworks Painting",
    ],
  },
];

export const ADDITIONAL_CATEGORIES = [
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
  responses: Record<string, CategoryResponse>;
  additional_categories_requested: string[];
  additional_vendors: Record<string, string[]>;
}
