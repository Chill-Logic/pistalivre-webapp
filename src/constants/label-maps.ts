/**
 * Names of the label maps served by GET /labels (src/lib/labels.ts in the
 * API). The API is the single source of Portuguese labels — never copy them.
 */
export const LABEL_MAPS = {
  vehicleStatus: "VEHICLE_STATUS_LABELS",
  rentalStatus: "RENTAL_STATUS_LABELS",
  ratePeriod: "RATE_PERIOD_LABELS",
  paymentMethod: "PAYMENT_METHOD_LABELS",
  paymentStatus: "PAYMENT_STATUS_LABELS",
  paymentPurpose: "PAYMENT_PURPOSE_LABELS",
  leadStatus: "LEAD_STATUS_LABELS",
  cautionType: "CAUTION_TYPE_LABELS",
  rentBillingTiming: "RENT_BILLING_TIMING_LABELS",
  weekday: "WEEKDAY_LABELS",
  customerStatus: "CUSTOMER_STATUS_LABELS",
  maintenanceType: "MAINTENANCE_TYPE_LABELS",
  maintenanceService: "MAINTENANCE_SERVICE_LABELS",
  inspectionType: "INSPECTION_TYPE_LABELS",
  inspectionActor: "INSPECTION_ACTOR_LABELS",
} as const;

export type LabelMapName = (typeof LABEL_MAPS)[keyof typeof LABEL_MAPS];
