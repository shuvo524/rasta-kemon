export type Category =
  | "damage"
  | "waterlogging"
  | "construction"
  | "closure"
  | "obstruction"
  | "other";

export type Status =
  | "pending"
  | "verified"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface Report {
  id: number | string;
  title: string;
  category: Category;
  description: string;
  area: string;
  district: string;
  lat: number;
  lng: number;
  status: Status;
  confirmCount: number;
  severity: 1 | 2 | 3;
  createdAt: string;
  /** Always true for the seeded set — shown with a visible "Demo" badge. */
  isDemo: boolean;
  photoUrl?: string | null;
  reporterName?: string;
  /** Phase B server-side counts (optional — demo data only carries confirmCount). */
  resolvedVotes?: number;
  flagCount?: number;
}

/** Category colours — the single source of truth for markers, chips and badges. */
export const CATEGORY_COLORS: Record<Category, string> = {
  damage: "#dc2626",
  waterlogging: "#ea580c",
  construction: "#ca8a04",
  closure: "#7c3aed",
  obstruction: "#2563eb",
  other: "#64748b",
};

export const CATEGORY_KEYS: Category[] = [
  "damage",
  "waterlogging",
  "construction",
  "closure",
  "obstruction",
  "other",
];

export const STATUS_KEYS: Status[] = [
  "pending",
  "verified",
  "in_progress",
  "resolved",
  "rejected",
];

/**
 * Seeded demonstration reports. Every entry is real Bangladeshi geography
 * with realistic descriptions, but they are DEMO data — each carries
 * isDemo: true and the UI always shows a "Demo" badge on them.
 * Do not invent additional reports or stats; stats are computed from this file.
 */
export const demoReports: Report[] = [
  {
    id: 1,
    title: "মিরপুর ১০ গোলচত্বরে গভীর গর্ত",
    category: "damage",
    description:
      "গোলচত্বরের পশ্চিম পাশে বড় গর্ত; বৃষ্টি হলে পানি জমে আরও বিপজ্জনক হয়ে ওঠে। বাইক চালকদের সতর্ক থাকতে হবে।",
    area: "মিরপুর ১০, ঢাকা",
    district: "ঢাকা",
    lat: 23.8069,
    lng: 90.3687,
    status: "verified",
    confirmCount: 14,
    severity: 3,
    createdAt: "2026-11-26T14:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 2,
    title: "ধানমন্ডি ২৭ নম্বরে জলাবদ্ধতা",
    category: "waterlogging",
    description:
      "মাঝারি বৃষ্টিতেই হাঁটুপানি জমে যায়। পথচারীদের চলাচল প্রায় বন্ধ; ড্রেনেজ মুখ বন্ধ থাকতে পারে।",
    area: "ধানমন্ডি ২৭, ঢাকা",
    district: "ঢাকা",
    lat: 23.7639,
    lng: 90.3753,
    status: "verified",
    confirmCount: 21,
    severity: 2,
    createdAt: "2026-11-26T10:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 3,
    title: "উত্তরা হাউস বিল্ডিং মোড়ে সড়ক সংস্কার চলছে",
    category: "construction",
    description:
      "এক লেন বন্ধ রেখে সংস্কার কাজ চলছে। সকালের দিকে ধীরগতি; বিকল্প হিসেবে বিমানবন্দর সড়ক ব্যবহার করা যায়।",
    area: "উত্তরা, ঢাকা",
    district: "ঢাকা",
    lat: 23.8759,
    lng: 90.3795,
    status: "in_progress",
    confirmCount: 8,
    severity: 2,
    createdAt: "2026-11-25T17:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 4,
    title: "যাত্রাবাড়ী ফ্লাইওভার নিচে রাস্তা আংশিক বন্ধ",
    category: "closure",
    description:
      "ফ্লাইওভারের নিচের অংশে পানি নিষ্কাশনের কাজের জন্য এক পাশ বন্ধ। হালকা যানবাহন পাশের গলি দিয়ে যাচ্ছে।",
    area: "যাত্রাবাড়ী, ঢাকা",
    district: "ঢাকা",
    lat: 23.7104,
    lng: 90.4353,
    status: "pending",
    confirmCount: 3,
    severity: 3,
    createdAt: "2026-11-26T17:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 5,
    title: "ফার্মগেটে ফুটপাতে নির্মাণসামগ্রী, পথ অবরুদ্ধ",
    category: "obstruction",
    description:
      "ফুটপাতজুড়ে বালু ও রড রাখা; পথচারীদের মূল রাস্তায় নেমে হাঁটতে হচ্ছে, যা ঝুঁকিপূর্ণ।",
    area: "ফার্মগেট, ঢাকা",
    district: "ঢাকা",
    lat: 23.7561,
    lng: 90.3872,
    status: "pending",
    confirmCount: 5,
    severity: 2,
    createdAt: "2026-11-26T05:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 6,
    title: "মতিঝিল শাপলা চত্বরের সামনে রাস্তা ভাঙা",
    category: "damage",
    description:
      "বাস টার্মিনালের সামনে ইট-সুরকি উঠে গেছে; বাস ঘুরতে গিয়ে প্রায়ই আটকে যায়।",
    area: "মতিঝিল, ঢাকা",
    district: "ঢাকা",
    lat: 23.7339,
    lng: 90.4172,
    status: "verified",
    confirmCount: 11,
    severity: 2,
    createdAt: "2026-11-25T11:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 7,
    title: "গুলশান ২ গোলচত্বরের কাছে ড্রেনের ঢাকনা ভাঙা",
    category: "other",
    description:
      "ড্রেনের লোহার ঢাকনা ভেঙে গর্ত হয়ে আছে; রাতে দেখা যায় না। সাময়িকভাবে একটি কোন রাখা হয়েছে।",
    area: "গুলশান ২, ঢাকা",
    district: "ঢাকা",
    lat: 23.7925,
    lng: 90.4078,
    status: "pending",
    confirmCount: 6,
    severity: 3,
    createdAt: "2026-11-26T12:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 8,
    title: "চট্টগ্রাম জিইসি মোড়ে জলাবদ্ধতা",
    category: "waterlogging",
    description:
      "বৃষ্টির পর মোড়ে পানি জমে থাকে প্রায় এক ঘণ্টা; সিএনজি ও রিকশা চলাচলে ভোগান্তি।",
    area: "জিইসি মোড়, চট্টগ্রাম",
    district: "চট্টগ্রাম",
    lat: 22.359,
    lng: 91.8205,
    status: "verified",
    confirmCount: 9,
    severity: 2,
    createdAt: "2026-11-25T23:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 9,
    title: "সিলেট জিন্দাবাজারে রাস্তা মেরামত শেষ",
    category: "construction",
    description:
      "দীর্ঘদিনের সংস্কার কাজ শেষ হয়েছে; এখন যান চলাচল স্বাভাবিক। কমিউনিটির কয়েকজন সমাধান নিশ্চিত করেছেন।",
    area: "জিন্দাবাজার, সিলেট",
    district: "সিলেট",
    lat: 24.8865,
    lng: 91.8807,
    status: "resolved",
    confirmCount: 17,
    severity: 1,
    createdAt: "2026-11-24T17:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
  {
    id: 10,
    title: "খুলনা সোনাডাঙ্গায় রাস্তার পাশে গাছ পড়ে আছে",
    category: "obstruction",
    description:
      "ঝড়ে উপড়ে পড়া গাছ রাস্তার একাংশ আটকে রেখেছে; যানবাহন এক লেন দিয়ে ধীরে চলছে।",
    area: "সোনাডাঙ্গা, খুলনা",
    district: "খুলনা",
    lat: 22.8155,
    lng: 89.5656,
    status: "in_progress",
    confirmCount: 4,
    severity: 2,
    createdAt: "2026-11-26T08:54:27Z",
    isDemo: true,
    photoUrl: null,
    reporterName: "RASTA KEMON Demo",
  },
];

/** Stats are always computed from the data — never invented. */
export function computeStats(reports: Report[]) {
  return {
    total: reports.length,
    active: reports.filter((r) => r.status !== "resolved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    pending: reports.filter((r) => r.status === "pending").length,
    confirmations: reports.reduce((sum, r) => sum + r.confirmCount, 0),
    districts: new Set(reports.map((r) => r.district)).size,
  };
}

/** Haversine distance in metres. */
export function distanceMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Find a likely duplicate: same category within ~150 m and still active. */
export function findDuplicate(
  reports: Report[],
  category: Category,
  lat: number,
  lng: number
): Report | undefined {
  return reports.find(
    (r) =>
      r.category === category &&
      r.status !== "resolved" &&
      distanceMetres(r.lat, r.lng, lat, lng) <= 150
  );
}

/** Reports nearest to a point (excluding the report itself when id given). */
export function nearbyReports(
  reports: Report[],
  lat: number,
  lng: number,
  excludeId?: number | string,
  limit = 4
): { report: Report; distanceKm: number }[] {
  return reports
    .filter((r) => String(r.id) !== String(excludeId))
    .map((r) => ({
      report: r,
      distanceKm: distanceMetres(lat, lng, r.lat, r.lng) / 1000,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
