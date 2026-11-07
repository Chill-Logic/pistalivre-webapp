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
