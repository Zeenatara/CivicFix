// Data layer for reports. Swap these functions for Supabase calls later.
export type CategoryId = "road" | "streetlight" | "garbage" | "water" | "property" | "other";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "road", label: "Road / Pothole" },
  { id: "streetlight", label: "Streetlight" },
  { id: "garbage", label: "Garbage / Waste" },
  { id: "water", label: "Water / Drainage" },
  { id: "property", label: "Public Property" },
  { id: "other", label: "Other" },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? "Other";

export interface Report {
  id: string;
  description: string;
  photo: string | null;
  location: string;
  category: CategoryId;
  complaint: string;
  status: "Draft";
  createdAt: string;
}

const KEY = "civicfix.reports";

export function listReports(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function getReport(id: string) {
  return listReports().find((r) => r.id === id) ?? null;
}

export function saveReport(report: Report) {
  const others = listReports().filter((r) => r.id !== report.id);
  const all = [report, ...others];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full (large photos) — keep text, drop photos.
    localStorage.setItem(KEY, JSON.stringify(all.map((r) => ({ ...r, photo: null }))));
  }
}

const IMPACT: Record<CategoryId, string> = {
  road: "This poses a risk to vehicles and pedestrians and may lead to accidents if left unattended.",
  streetlight: "This is affecting visibility in the area, particularly after dark, and raises safety concerns for residents.",
  garbage: "The accumulated waste is creating unhygienic conditions and may pose health risks to residents.",
  water: "This is causing inconvenience to residents and may lead to waterlogging or health hazards.",
  property: "The damage reduces the usability of a shared public facility and may worsen over time.",
  other: "This is causing inconvenience to residents in the area.",
};

const ACTION: Record<CategoryId, string> = {
  road: "inspect the road surface and arrange the necessary repairs",
  streetlight: "inspect the streetlight and arrange the necessary repair",
  garbage: "arrange for the waste to be cleared and ensure regular collection",
  water: "inspect the drainage/water line and take corrective action",
  property: "inspect the damaged property and arrange for its repair or restoration",
  other: "look into the matter and take appropriate action",
};

// Template-based generator. Replace with an AI call later; keep the signature.
export async function generateComplaint(input: {
  description: string;
  location: string;
  category: CategoryId;
  hasPhoto: boolean;
}): Promise<string> {
  await new Promise((r) => setTimeout(r, 1100));
  const desc = input.description.trim().replace(/\s+/g, " ").replace(/\.?$/, ".");
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  return [
    `Subject: Complaint regarding ${categoryLabel(input.category).toLowerCase()} issue at ${input.location}`,
    "",
    "To the Concerned Authority,",
    "",
    `I would like to bring to your attention an issue at ${input.location}. ${desc}`,
    "",
    `${IMPACT[input.category]}${input.hasPhoto ? " A photograph of the issue is attached for reference." : ""}`,
    "",
    `I kindly request you to ${ACTION[input.category]} at the earliest.`,
    "",
    "Thank you for your attention to this matter.",
    "",
    "Sincerely,",
    "A concerned resident",
    `Date: ${date}`,
  ].join("\n");
}
