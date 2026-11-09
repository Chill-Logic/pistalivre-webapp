import type { LeadFilters } from "@/types/crm";
import type { CustomerFilters } from "@/types/customer";
import type { InspectionFilters } from "@/types/inspection";
import type { MaintenanceFilters } from "@/types/maintenance";
import type { RentalFilters } from "@/types/rental";
import type { StatementFilters } from "@/types/statement";
import type { InstallmentPlanParams } from "@/types/charge";
import type { PartnerFilters } from "@/types/partner";
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
    cautionPlan: (id: string) =>
      [...queryKeys.rentals.all, "caution-plan", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters: CustomerFilters) =>
      [...queryKeys.customers.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
    asaasDirectory: () =>
      [...queryKeys.customers.all, "asaas-directory"] as const,
  },
  labels: {
    all: ["labels"] as const,
  },
  maintenances: {
    all: ["maintenances"] as const,
    providers: () => [...queryKeys.maintenances.all, "providers"] as const,
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
    inspectionRequirements: (rentalId: string) =>
      [...queryKeys.portal.all, "inspection-requirements", rentalId] as const,
    rentalSections: (id: string) =>
      [...queryKeys.portal.all, "rental-sections", id] as const,
    profile: () => [...queryKeys.portal.all, "profile"] as const,
    allRentalSections: () =>
      [...queryKeys.portal.all, "rental-sections"] as const,
    documentCategories: (ownerType: string) =>
      [...queryKeys.portal.all, "document-categories", ownerType] as const,
    charges: () => [...queryKeys.portal.all, "charges"] as const,
    invoices: () => [...queryKeys.portal.all, "invoices"] as const,
    wallet: () => [...queryKeys.portal.all, "wallet"] as const,
    reimbursements: () => [...queryKeys.portal.all, "reimbursements"] as const,
  },
  /** The partner's own area (app.parceiro, partner Bearer). */
  partnerArea: {
    all: ["partner-area"] as const,
    home: () => [...queryKeys.partnerArea.all, "home"] as const,
    vehicle: (id: string) =>
      [...queryKeys.partnerArea.all, "vehicle", id] as const,
    rental: (id: string) =>
      [...queryKeys.partnerArea.all, "rental", id] as const,
  },
  finance: {
    all: ["finance"] as const,
    balances: () => [...queryKeys.finance.all, "balances"] as const,
    delinquency: () => [...queryKeys.finance.all, "delinquency"] as const,
    toCollect: () => [...queryKeys.finance.all, "to-collect"] as const,
    statement: (filters: StatementFilters) =>
      [...queryKeys.finance.all, "statement", filters] as const,
    statementExports: () =>
      [...queryKeys.finance.all, "statement-exports"] as const,
    transfers: () => [...queryKeys.finance.all, "transfers"] as const,
  },
  debts: {
    all: ["debts"] as const,
    list: () => [...queryKeys.debts.all, "list"] as const,
    detail: (id: string) => [...queryKeys.debts.all, "detail", id] as const,
    byVehicle: (vehicleId: string) =>
      [...queryKeys.debts.all, "vehicle", vehicleId] as const,
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
    months: (id: string) => [...queryKeys.suppliers.all, "months", id] as const,
  },
  ai: {
    all: ["ai"] as const,
    me: () => [...queryKeys.ai.all, "me"] as const,
    consent: (query: string) => [...queryKeys.ai.all, "consent", query] as const,
    permissions: () => [...queryKeys.ai.all, "permissions"] as const,
    clients: () => [...queryKeys.ai.all, "clients"] as const,
    audit: () => [...queryKeys.ai.all, "audit"] as const,
    auditEntry: (id: string) => [...queryKeys.ai.all, "audit-entry", id] as const,
    gaps: (de: string, ate: string) => [...queryKeys.ai.all, "gaps", de, ate] as const,
  },
  aiUsage: {
    all: ["ai-usage"] as const,
    summary: (month: string) => [...queryKeys.aiUsage.all, "summary", month] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    month: (month: string) => [...queryKeys.expenses.all, "month", month] as const,
    detail: (id: string) => [...queryKeys.expenses.all, "detail", id] as const,
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
  proposals: {
    all: ["proposals"] as const,
    detail: (id: string) => [...queryKeys.proposals.all, "detail", id] as const,
  },
  signatures: {
    all: ["signatures"] as const,
    detail: (id: string) =>
      [...queryKeys.signatures.all, "detail", id] as const,
  },
  plans: {
    all: ["plans"] as const,
    detail: (id: string) => [...queryKeys.plans.all, "detail", id] as const,
  },
  templates: {
    all: ["templates"] as const,
    contracts: () => [...queryKeys.templates.all, "contracts"] as const,
    contract: (id: string) =>
      [...queryKeys.templates.all, "contract", id] as const,
    inspection: () => [...queryKeys.templates.all, "inspection"] as const,
    variables: () => [...queryKeys.templates.all, "variables"] as const,
    proposals: () => [...queryKeys.templates.all, "proposals"] as const,
    proposal: (id: string) =>
      [...queryKeys.templates.all, "proposal", id] as const,
    proposalVariables: () =>
      [...queryKeys.templates.all, "proposal-variables"] as const,
  },
  documents: {
    all: ["documents"] as const,
    tree: (path: string) => [...queryKeys.documents.all, "tree", path] as const,
    search: (q: string) => [...queryKeys.documents.all, "search", q] as const,
    categories: (ownerType: string) =>
      [...queryKeys.documents.all, "categories", ownerType] as const,
  },
  company: {
    all: ["company"] as const,
    integrations: ["company", "integrations"] as const,
    /** Outside `company`: it asks the Inter live, so a document upload
     *  invalidating the company must not refetch it. */
    interWebhook: ["inter-webhook"] as const,
  },
  projections: {
    all: ["projections"] as const,
    seed: (sim: string) => [...queryKeys.projections.all, "seed", sim] as const,
  },
  installmentPlan: (params: InstallmentPlanParams) =>
    ["installment-plan", params] as const,
  dashboard: {
    all: ["dashboard"] as const,
  },
  partners: {
    all: ["partners"] as const,
    list: (filters: PartnerFilters) =>
      [...queryKeys.partners.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.partners.all, "detail", id] as const,
    contract: (id: string) =>
      [...queryKeys.partners.all, "contract", id] as const,
  },
};
