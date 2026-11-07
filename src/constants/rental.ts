import type { RentalStatus } from "@/types/rental";

const EARLY_EXITS: RentalStatus[] = ["ACTIVE", "CANCELLED", "WITHDRAWN"];

/**
 * Legal status transitions (same rule as the API's rental.entity; an illegal
 * one answers 422). Only these become buttons. RETURNED/CANCELLED/WITHDRAWN
 * are final.
 */
export const RENTAL_TRANSITIONS: Record<RentalStatus, RentalStatus[]> = {
  DRAFT: [
    "RESERVED",
    "CONTRACT_PENDING",
    "SIGNED",
    "AWAITING_CAUTION",
    "AWAITING_DELIVERY",
    ...EARLY_EXITS,
  ],
  RESERVED: [
    "CONTRACT_PENDING",
    "SIGNED",
    "AWAITING_CAUTION",
    "AWAITING_DELIVERY",
    ...EARLY_EXITS,
  ],
  CONTRACT_PENDING: [
    "SIGNED",
    "AWAITING_CAUTION",
    "AWAITING_DELIVERY",
    ...EARLY_EXITS,
  ],
  SIGNED: ["AWAITING_CAUTION", "AWAITING_DELIVERY", ...EARLY_EXITS],
  AWAITING_CAUTION: ["AWAITING_DELIVERY", ...EARLY_EXITS],
  AWAITING_DELIVERY: EARLY_EXITS,
  ACTIVE: ["RETURNED", "CANCELLED"],
  RETURNED: [],
  CANCELLED: [],
  WITHDRAWN: [],
};
