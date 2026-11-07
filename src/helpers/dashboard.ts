import {
  CHART_COLORS,
  DASHBOARD_TOP_ITEMS,
  FLEET_STATUS_COLORS,
  FUNNEL_HIDDEN_STAGES,
} from "@/constants/chart";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import type { LabelMap } from "@/types/labels";
import type { BarItem, ColumnGroup } from "@/types/chart";
import type { Balances, Dashboard } from "@/types/dashboard";
import type { VehicleStatus } from "@/types/vehicle";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

type LabelFn = (map: LabelMapName, code: string) => string;

const FLEET_ORDER: {
  status: VehicleStatus;
  key: keyof Dashboard["analytics"]["fleet"];
}[] = [
  { status: "AVAILABLE", key: "available" },
  { status: "RENTED", key: "rented" },
  { status: "MAINTENANCE", key: "maintenance" },
  { status: "INACTIVE", key: "inactive" },
];

/** Palette color by position (never invents a new hue). */
export function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Lead stages in the API's order, without the terminal ones. */
export function funnelStages(statusMap: LabelMap | undefined) {
  if (!statusMap || Array.isArray(statusMap)) return [];
  return Object.keys(statusMap).filter(
    (code) => !FUNNEL_HIDDEN_STAGES.includes(code),
  );
}

export function openLeadCount(
  byStatus: Record<string, number>,
  stages: string[],
) {
  return stages.reduce((total, stage) => total + (byStatus[stage] ?? 0), 0);
}

/**
 * Consolidated balance: `null` when no source answered — the screen says
 * "Indisponível", never R$ 0,00.
 */
export function consolidatedBalance(balances: Balances) {
  if (balances.asaas == null && balances.bank == null) return null;
  return balances.consolidated;
}

/**
 * Hint under a partial total, naming the source that did not answer
 * ("Banco indisponível"). Undefined when every source answered.
 */
export function balanceHint(balances: Balances) {
  const missing = [
    balances.asaas == null && "Asaas",
    balances.bank == null && "Banco",
  ].filter(Boolean);
  if (missing.length === 0) return undefined;
  return `${missing.join(" e ")} ${missing.length === 1 ? "indisponível" : "indisponíveis"}`;
}

/** Vehicles with any maintenance or inspection — rows of zeros are noise. */
export function vehiclesWithActivity(dashboard: Dashboard) {
  return dashboard.analytics.vehicleRanking.filter(
    (vehicle) => vehicle.maintenanceCount > 0 || vehicle.inspectionCount > 0,
  );
}

export function fleetItems(dashboard: Dashboard, label: LabelFn): BarItem[] {
  const { fleet } = dashboard.analytics;
  return FLEET_ORDER.map(({ status, key }) => ({
    key: status,
    label: label(LABEL_MAPS.vehicleStatus, status),
    value: fleet[key],
    display: String(fleet[key]),
    color: FLEET_STATUS_COLORS[status],
  }));
}

export function overdueByPurposeItems(
  dashboard: Dashboard,
  label: LabelFn,
): BarItem[] {
  return dashboard.delinquency.overdueByPurpose.map((item, index) => ({
    key: item.purpose,
    label: label(LABEL_MAPS.paymentPurpose, item.purpose),
    value: item.amount,
    display: formatCurrency(item.amount),
    color: chartColor(index),
  }));
}

export function topDebtorItems(dashboard: Dashboard): BarItem[] {
  return dashboard.delinquency.delinquentCustomers
    .slice(0, DASHBOARD_TOP_ITEMS)
    .map((customer) => ({
      key: customer.customerId,
      label: customer.name,
      value: customer.amount,
      display: formatCurrency(customer.amount),
      to: routeTo.customer(customer.customerId),
    }));
}

export function funnelItems(
  dashboard: Dashboard,
  stages: string[],
  label: LabelFn,
): BarItem[] {
  return stages.map((stage) => {
    const count = dashboard.funnel.byStatus[stage] ?? 0;
    return {
      key: stage,
      label: label(LABEL_MAPS.leadStatus, stage),
      value: count,
      display: String(count),
      color: CHART_COLORS[1],
    };
  });
}

export function leadSourceItems(dashboard: Dashboard): BarItem[] {
  return dashboard.funnel.bySource.map((source) => ({
    key: source.source,
    label: source.source,
    value: source.total,
    display: `${source.total} · ${pluralize(source.won, "efetivado", "efetivados")}`,
    color: CHART_COLORS[2],
  }));
}

export function maintenanceTypeItems(dashboard: Dashboard): BarItem[] {
  return dashboard.analytics.maintenance.byType.map((type, index) => ({
    key: type.key,
    label: type.label,
    value: type.count,
    display: String(type.count),
    color: chartColor(index),
  }));
}

export function maintenanceServiceItems(dashboard: Dashboard): BarItem[] {
  return dashboard.analytics.maintenance.byService
    .slice(0, DASHBOARD_TOP_ITEMS)
    .map((service) => ({
      key: service.key,
      label: service.label,
      value: service.count,
      display: String(service.count),
      color: CHART_COLORS[3],
    }));
}

export function costByVehicleItems(dashboard: Dashboard): BarItem[] {
  return dashboard.analytics.maintenance.costByVehicle
    .slice(0, DASHBOARD_TOP_ITEMS)
    .map((vehicle) => ({
      key: vehicle.vehicleId,
      label: `${vehicle.plate} · ${vehicle.label}`,
      value: vehicle.cost,
      display: formatCurrency(vehicle.cost),
      to: routeTo.vehicle(vehicle.vehicleId),
    }));
}

export function monthlyGroups(dashboard: Dashboard): ColumnGroup[] {
  return dashboard.analytics.monthly.map((month) => ({
    key: month.month,
    label: month.label,
    values: {
      maintenances: month.maintenances,
      inspections: month.inspections,
      cost: month.maintenanceCost,
    },
  }));
}
