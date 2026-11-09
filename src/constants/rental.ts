import type { RentalStatus } from "@/types/rental";

/** Final statuses: the rental is history (read-only for the renter). */
export const CLOSED_RENTAL_STATUSES: readonly RentalStatus[] = [
  "RETURNED",
  "CANCELLED",
  "WITHDRAWN",
];

const EARLY_EXITS: RentalStatus[] = ["ACTIVE", "CANCELLED", "WITHDRAWN"];

/** "Outro" reason: asks for a text. */
export const OTHER_TERMINATION_REASON = "OTHER";

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
  // An active rental only ends through the termination (date + reasons).
  ACTIVE: [],
  RETURNED: [],
  CANCELLED: [],
  WITHDRAWN: [],
};
