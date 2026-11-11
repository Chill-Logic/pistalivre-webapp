import type { VehicleStatus } from "@/types/vehicle";

/**
 * Categorical palette, same as the API's dashboard (validated for light and
 * dark). Fixed order; the brand red is the first slot.
 */
export const CHART_COLORS = [
  "#E4141B",
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DB2777",
] as const;

/** Fleet status is a state palette (reserved), not a categorical one. */
export const FLEET_STATUS_COLORS: Record<VehicleStatus, string> = {
  AVAILABLE: "#059669",
  IN_CONTRACTING: "#CA8A04",
  RESERVED: "#7C3AED",
  RENTED: "#2563EB",
  MAINTENANCE: "#D97706",
  INACTIVE: "#94A3B8",
};

/** Lead stages shown in the funnel (lost is terminal and stays out). */
export const FUNNEL_HIDDEN_STAGES = ["LOST"];

/** How many items a ranking card shows. */
export const DASHBOARD_TOP_ITEMS = 6;

/** Monthly series (keys match `monthlyGroups`). */
export const MONTHLY_ACTIVITY_SERIES = [
  { key: "maintenances", name: "Manutenções", color: CHART_COLORS[0] },
  { key: "inspections", name: "Vistorias", color: CHART_COLORS[1] },
];

export const MONTHLY_COST_SERIES = [
  { key: "cost", name: "Gasto", color: CHART_COLORS[4] },
];
