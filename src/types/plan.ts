import type { RatePeriod } from "@/types/rental";

/** The commercial OFFER (the rental freezes its own agreed price). */
export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rate: number;
  ratePeriod: RatePeriod;
  /** null = no fixed term. */
  durationMonths: number | null;
  renewable: boolean;
  noFidelity: boolean;
  /** The vehicle becomes the customer's at the end. */
  ownershipAtEnd: boolean;
  highlights: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
