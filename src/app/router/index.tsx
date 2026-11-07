import { createBrowserRouter } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import { ROUTES } from "@/constants/routes";
import { ComingSoonPage } from "@/pages/coming-soon";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { VehicleDetailPage } from "@/pages/vehicle-detail";
import { VehiclesPage } from "@/pages/vehicles";

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.vehicles, element: <VehiclesPage /> },
      { path: ROUTES.vehicleDetail, element: <VehicleDetailPage /> },
      { path: ROUTES.rentals, element: <ComingSoonPage title="Locações" /> },
      { path: ROUTES.customers, element: <ComingSoonPage title="Clientes" /> },
      { path: ROUTES.finance, element: <ComingSoonPage title="Financeiro" /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
