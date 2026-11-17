import type { MaintenanceType } from "@/types/maintenance";

/** How the maintenance cost is cut (`groupBy` of the API). */
export type AnalysisDimension =
  | "vehicle"
  | "model"
  | "year"
  | "owner"
  | "customer"
  | "rental"
  | "month"
  | "tenure"
  | "type"
  | "service"
  | "provider"
  | "payer";

/** The measure the chart and the order follow. */
export type AnalysisSort =
  | "natural"
  | "cost"
  | "costPerVehicleMonth"
  | "costPerKm"
  | "revenueShare"
  | "count";

export type MaintenancePayer =
  | "COMPANY"
  | "CUSTOMER_REIMBURSED"
  | "CUSTOMER_PENDING"
  | "CUSTOMER_NOT_REIMBURSED";

/** The four rulers, ready from the server (never recomputed here). */
export type AnalysisMeasures = {
  count: number;
  withoutCost: number;
  cost: number;
  /** Vehicle-months in the fleet. */
  fleetMonths: number;
  costPerVehicleMonth: number | null;
  km: number;
  /** Cost of the maintenances on days with a measured km. */
  kmCost: number;
  kmCount: number;
  costPerKm: number | null;
  /** Rent received (no caução). */
  revenue: number;
  /** Cost ÷ revenue, in %. */
  revenueShare: number | null;
};

export type AnalysisRow = AnalysisMeasures & {
  key: string;
  label: string;
  detail: string | null;
  link: { kind: "vehicle" | "customer" | "rental"; id: string } | null;
};

export type AnalysisMaintenanceItem = {
  id: string;
  /** Calendar date (midnight UTC). */
  performedAt: string;
  vehicleLabel: string;
  plate: string;
  type: MaintenanceType;
  services: string[];
  cost: number | null;
  provider: string | null;
  description: string | null;
  payer: MaintenancePayer;
  rentalCode: string | null;
  customerName: string | null;
};

export type MaintenanceAnalysis = {
  dimension: AnalysisDimension | null;
  from: string;
  to: string;
  totals: AnalysisMeasures;
  rows: AnalysisRow[];
  /** The rows' denominator is the whole fleet (type, service…). */
  fleetWide: boolean;
  kmCoverage: { vehicles: number; withKm: number };
  maintenances?: AnalysisMaintenanceItem[];
};

export type MaintenanceAnalysisFilters = {
  dimension: AnalysisDimension;
  /** YYYY-MM-DD */
  from: string;
  to: string;
};

/** The dashboard card: totals of the last 12 months. */
export type MaintenanceRate = {
  from: string;
  to: string;
  totals: AnalysisMeasures;
  kmCoverage: { vehicles: number; withKm: number };
};
