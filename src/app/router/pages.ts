import { lazyPage } from "@/helpers/lazy-page";

export const DashboardPage = lazyPage(
  () => import("@/pages/gestao/dashboard"),
  "DashboardPage",
);
export const VehiclesPage = lazyPage(
  () => import("@/pages/gestao/vehicles"),
  "VehiclesPage",
);
export const VehicleDetailPage = lazyPage(
  () => import("@/pages/gestao/vehicle-detail"),
  "VehicleDetailPage",
);
export const RentalsPage = lazyPage(
  () => import("@/pages/gestao/rentals"),
  "RentalsPage",
);
export const RentalDetailPage = lazyPage(
  () => import("@/pages/gestao/rental-detail"),
  "RentalDetailPage",
);
export const CustomersPage = lazyPage(
  () => import("@/pages/gestao/customers"),
  "CustomersPage",
);
export const CustomerDetailPage = lazyPage(
  () => import("@/pages/gestao/customer-detail"),
  "CustomerDetailPage",
);
export const MaintenancesPage = lazyPage(
  () => import("@/pages/gestao/maintenances"),
  "MaintenancesPage",
);
export const MaintenanceDetailPage = lazyPage(
  () => import("@/pages/gestao/maintenance-detail"),
  "MaintenanceDetailPage",
);
export const InspectionsPage = lazyPage(
  () => import("@/pages/gestao/inspections"),
  "InspectionsPage",
);
export const InspectionDetailPage = lazyPage(
  () => import("@/pages/gestao/inspection-detail"),
  "InspectionDetailPage",
);
export const CustomerLoginPage = lazyPage(
  () => import("@/pages/cliente/login"),
  "CustomerLoginPage",
);
export const PortalHomePage = lazyPage(
  () => import("@/pages/cliente/home"),
  "PortalHomePage",
);
export const PortalRentalDetailPage = lazyPage(
  () => import("@/pages/cliente/rental-detail"),
  "PortalRentalDetailPage",
);
export const VehicleNewPage = lazyPage(
  () => import("@/pages/gestao/vehicle-new"),
  "VehicleNewPage",
);
export const VehicleEditPage = lazyPage(
  () => import("@/pages/gestao/vehicle-edit"),
  "VehicleEditPage",
);
export const FinancePage = lazyPage(
  () => import("@/pages/gestao/finance"),
  "FinancePage",
);
export const FinanceStatementPage = lazyPage(
  () => import("@/pages/gestao/finance-statement"),
  "FinanceStatementPage",
);
export const FinanceDebtsPage = lazyPage(
  () => import("@/pages/gestao/finance-debts"),
  "FinanceDebtsPage",
);
export const DebtDetailPage = lazyPage(
  () => import("@/pages/gestao/debt-detail"),
  "DebtDetailPage",
);
export const ReimbursementsPage = lazyPage(
  () => import("@/pages/gestao/reimbursements"),
  "ReimbursementsPage",
);
export const SuppliersPage = lazyPage(
  () => import("@/pages/gestao/suppliers"),
  "SuppliersPage",
);
export const SupplierDetailPage = lazyPage(
  () => import("@/pages/gestao/supplier-detail"),
  "SupplierDetailPage",
);
export const SupplierNewPage = lazyPage(
  () => import("@/pages/gestao/supplier-new"),
  "SupplierNewPage",
);
export const SupplierEditPage = lazyPage(
  () => import("@/pages/gestao/supplier-edit"),
  "SupplierEditPage",
);
export const CrmPage = lazyPage(() => import("@/pages/gestao/crm"), "CrmPage");
export const LeadDetailPage = lazyPage(
  () => import("@/pages/gestao/lead-detail"),
  "LeadDetailPage",
);
export const UsersPage = lazyPage(
  () => import("@/pages/gestao/users"),
  "UsersPage",
);
export const UserDetailPage = lazyPage(
  () => import("@/pages/gestao/user-detail"),
  "UserDetailPage",
);
export const CompanyPage = lazyPage(
  () => import("@/pages/gestao/company"),
  "CompanyPage",
);
export const PlansPage = lazyPage(
  () => import("@/pages/gestao/plans"),
  "PlansPage",
);
export const ModelsContractsPage = lazyPage(
  () => import("@/pages/gestao/models-contracts"),
  "ModelsContractsPage",
);
export const ModelsInspectionPage = lazyPage(
  () => import("@/pages/gestao/models-inspection"),
  "ModelsInspectionPage",
);
export const ContractTemplateDetailPage = lazyPage(
  () => import("@/pages/gestao/contract-template-detail"),
  "ContractTemplateDetailPage",
);
export const DocumentsPage = lazyPage(
  () => import("@/pages/gestao/documents"),
  "DocumentsPage",
);
export const CustomerNewPage = lazyPage(
  () => import("@/pages/gestao/customer-new"),
  "CustomerNewPage",
);
export const CustomerEditPage = lazyPage(
  () => import("@/pages/gestao/customer-edit"),
  "CustomerEditPage",
);
