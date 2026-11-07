import { lazyPage } from "@/helpers/lazy-page";

export const DashboardPage = lazyPage(
  () => import("@/pages/dashboard"),
  "DashboardPage",
);
export const VehiclesPage = lazyPage(
  () => import("@/pages/vehicles"),
  "VehiclesPage",
);
export const VehicleDetailPage = lazyPage(
  () => import("@/pages/vehicle-detail"),
  "VehicleDetailPage",
);
