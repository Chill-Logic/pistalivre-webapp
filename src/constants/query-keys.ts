import type { LeadFilters } from "@/types/crm";
import type { CustomerFilters } from "@/types/customer";
import type { InspectionFilters } from "@/types/inspection";
import type { MaintenanceFilters } from "@/types/maintenance";
import type { RentalFilters } from "@/types/rental";
import type { StatementFilters } from "@/types/statement";
import type { SupplierFilters } from "@/types/supplier";
import type { UserFilters } from "@/types/user";
import type { VehicleFilters } from "@/types/vehicle";

/** Query key factory: one place to build and invalidate cache keys. */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  vehicles: {
    all: ["vehicles"] as const,
    list: (filters: VehicleFilters) =>
      [...queryKeys.vehicles.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.vehicles.all, "detail", id] as const,
  },
  vehicleFormOptions: {
    all: ["vehicle-form-options"] as const,
  },
  vehicleTypes: {
    all: ["vehicle-types"] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    list: (filters: RentalFilters) =>
      [...queryKeys.rentals.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.rentals.all, "detail", id] as const,
    charges: (id: string) => [...queryKeys.rentals.all, "charges", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters: CustomerFilters) =>
      [...queryKeys.customers.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
  },
  labels: {
    all: ["labels"] as const,
  },
  maintenances: {
    all: ["maintenances"] as const,
    list: (filters: MaintenanceFilters) =>
      [...queryKeys.maintenances.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.maintenances.all, "detail", id] as const,
  },
  inspections: {
    all: ["inspections"] as const,
    list: (filters: InspectionFilters) =>
      [...queryKeys.inspections.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.inspections.all, "detail", id] as const,
  },
  portal: {
    all: ["portal"] as const,
    rentals: () => [...queryKeys.portal.all, "rentals"] as const,
    rental: (id: string) => [...queryKeys.portal.all, "rental", id] as const,
    rentalSections: (id: string) =>
      [...queryKeys.portal.all, "rental-sections", id] as const,
    charges: () => [...queryKeys.portal.all, "charges"] as const,
    invoices: () => [...queryKeys.portal.all, "invoices"] as const,
    wallet: () => [...queryKeys.portal.all, "wallet"] as const,
    reimbursements: () => [...queryKeys.portal.all, "reimbursements"] as const,
  },
  finance: {
    all: ["finance"] as const,
    balances: () => [...queryKeys.finance.all, "balances"] as const,
    delinquency: () => [...queryKeys.finance.all, "delinquency"] as const,
    toCollect: () => [...queryKeys.finance.all, "to-collect"] as const,
    statement: (filters: StatementFilters) =>
      [...queryKeys.finance.all, "statement", filters] as const,
  },
  debts: {
    all: ["debts"] as const,
    list: () => [...queryKeys.debts.all, "list"] as const,
    detail: (id: string) => [...queryKeys.debts.all, "detail", id] as const,
  },
  reimbursements: {
    all: ["reimbursements"] as const,
    staff: () => [...queryKeys.reimbursements.all, "staff"] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: (filters: SupplierFilters) =>
      [...queryKeys.suppliers.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.suppliers.all, "detail", id] as const,
  },
  crm: {
    all: ["crm"] as const,
    funnel: () => [...queryKeys.crm.all, "funnel"] as const,
    leads: (filters: LeadFilters) =>
      [...queryKeys.crm.all, "leads", filters] as const,
    lead: (id: string) => [...queryKeys.crm.all, "lead", id] as const,
    options: () => [...queryKeys.crm.all, "options"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters: UserFilters) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
  plans: {
    all: ["plans"] as const,
  },
  templates: {
    all: ["templates"] as const,
    contracts: () => [...queryKeys.templates.all, "contracts"] as const,
    contract: (id: string) =>
      [...queryKeys.templates.all, "contract", id] as const,
    inspection: () => [...queryKeys.templates.all, "inspection"] as const,
  },
  documents: {
    all: ["documents"] as const,
    tree: (path: string) => [...queryKeys.documents.all, "tree", path] as const,
    search: (q: string) => [...queryKeys.documents.all, "search", q] as const,
  },
  company: {
    all: ["company"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
  },
};
