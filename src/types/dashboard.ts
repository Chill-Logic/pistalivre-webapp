import type { VehicleStatus } from "@/types/vehicle";

export type FleetCounts = {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  inactive: number;
};

export type MaintenanceBreakdown = {
  key: string;
  label: string;
  count: number;
  cost: number;
};

export type VehicleCost = {
  vehicleId: string;
  label: string;
  plate: string;
  cost: number;
  count: number;
};

export type MonthlyActivity = {
  month: string;
  label: string;
  maintenances: number;
  inspections: number;
  maintenanceCost: number;
};

export type VehicleRankingItem = {
  vehicleId: string;
  label: string;
  plate: string;
  status: VehicleStatus;
  maintenanceCount: number;
  maintenanceCost: number;
  inspectionCount: number;
  lastMaintenance: string | null;
  lastInspection: string | null;
  currentKm: number | null;
};

export type DashboardAnalytics = {
  generatedAt: string;
  fleet: FleetCounts;
  activeRentals: number;
  maintenance: {
    totalCost: number;
    cost90d: number;
    count: number;
    count90d: number;
    avgCost: number;
    withoutCost: number;
    byType: MaintenanceBreakdown[];
    byService: MaintenanceBreakdown[];
    byProvider: MaintenanceBreakdown[];
    costByVehicle: VehicleCost[];
  };
  inspections: {
    count: number;
    count90d: number;
    byLessee: number;
    byLessor: number;
  };
  monthly: MonthlyActivity[];
  vehicleRanking: VehicleRankingItem[];
};

export type Delinquency = {
  overdue: { count: number; amount: number };
  pending: { count: number; amount: number };
  paid: { count: number; lateCount: number; avgDaysLate: number };
  overdueByPurpose: { purpose: string; count: number; amount: number }[];
  delinquentCustomers: {
    customerId: string;
    name: string;
    amount: number;
    count: number;
  }[];
  /** % overdue ÷ (overdue + pending), by amount (server; Financeiro only). */
  overdueRate?: number;
  /** Who pays late most often (history), with their average delay. */
  topLatePayers: {
    customerId: string;
    name: string;
    lateCount: number;
    avgDaysLate: number;
  }[];
};

export type LeadFunnel = {
  byStatus: Record<string, number>;
  bySource: { source: string; total: number; won: number }[];
};

export type Birthday = {
  id: string;
  name: string;
  kind: "CUSTOMER" | "STAFF";
  age: number;
};

/** Read-through balances: `null` means unavailable, never zero. */
export type Balances = {
  asaas: number | null;
  bank: number | null;
  consolidated: number | null;
};

export type Dashboard = {
  analytics: DashboardAnalytics;
  delinquency: Delinquency;
  funnel: LeadFunnel;
  birthdays: Birthday[];
  balances: Balances;
};
