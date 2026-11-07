import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  CustomerDetailPage,
  CustomersPage,
  DashboardPage,
  InspectionDetailPage,
  InspectionsPage,
  MaintenanceDetailPage,
  MaintenancesPage,
  RentalDetailPage,
  RentalsPage,
  VehicleDetailPage,
  VehiclesPage,
} from "./pages";
import { ROUTES } from "@/constants/routes";
import { ComingSoonPage } from "@/pages/comum/coming-soon";
import { LoginPage } from "@/pages/gestao/login";
import { NotFoundPage } from "@/pages/comum/not-found";

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
      { path: ROUTES.maintenances, element: <MaintenancesPage /> },
      { path: ROUTES.maintenanceDetail, element: <MaintenanceDetailPage /> },
      { path: ROUTES.inspections, element: <InspectionsPage /> },
      { path: ROUTES.inspectionDetail, element: <InspectionDetailPage /> },
      { path: ROUTES.rentals, element: <RentalsPage /> },
      { path: ROUTES.rentalDetail, element: <RentalDetailPage /> },
      { path: ROUTES.customers, element: <CustomersPage /> },
      { path: ROUTES.customerDetail, element: <CustomerDetailPage /> },
      { path: ROUTES.finance, element: <ComingSoonPage title="Financeiro" /> },
    ],
  },
  { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
