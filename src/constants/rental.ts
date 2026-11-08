import type { RentalStatus } from "@/types/rental";

/** Final statuses: the rental is history (read-only for the renter). */
export const CLOSED_RENTAL_STATUSES: readonly RentalStatus[] = [
  "RETURNED",
  "CANCELLED",
  "WITHDRAWN",
];

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

/**
 * The rental list opens on ACTIVE rentals (the day-to-day view; history only
 * grows), as the old screen did. No `?situacao=` = this default.
 */
export const DEFAULT_RENTAL_STATUS: RentalStatus = "ACTIVE";

/** Explicit "every status" in the URL (absence already means the default). */
export const ALL_RENTAL_STATUSES = "todas";
