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
