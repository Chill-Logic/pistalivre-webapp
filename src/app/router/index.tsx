import { createBrowserRouter } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  DashboardPage,
  RentalDetailPage,
  RentalsPage,
  VehicleDetailPage,
  VehiclesPage,
} from "./pages";
import { ROUTES } from "@/constants/routes";
import { ComingSoonPage } from "@/pages/coming-soon";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";

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
      { path: ROUTES.rentals, element: <RentalsPage /> },
      { path: ROUTES.rentalDetail, element: <RentalDetailPage /> },
      { path: ROUTES.customers, element: <ComingSoonPage title="Clientes" /> },
      { path: ROUTES.finance, element: <ComingSoonPage title="Financeiro" /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
