import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  CrmPage,
  CustomerDetailPage,
  CustomerLoginPage,
  CustomersPage,
  DashboardPage,
  DebtDetailPage,
  FinanceDebtsPage,
  FinancePage,
  FinanceStatementPage,
  LeadDetailPage,
  InspectionDetailPage,
  InspectionsPage,
  MaintenanceDetailPage,
  MaintenancesPage,
  PortalHomePage,
  PortalRentalDetailPage,
  ReimbursementsPage,
  RentalDetailPage,
  SupplierDetailPage,
  SuppliersPage,
  RentalsPage,
  VehicleDetailPage,
  VehicleEditPage,
  VehicleNewPage,
  VehiclesPage,
} from "./pages";
import { ROUTES } from "@/constants/routes";
import { LoginPage } from "@/pages/gestao/login";
import { NotFoundPage } from "@/pages/comum/not-found";

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated realm="gestao" />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <RedirectIfAuthenticated realm="cliente" />,
    children: [{ path: ROUTES.portalLogin, element: <CustomerLoginPage /> }],
  },
  {
    element: <RequireAuth realm="cliente" />,
    children: [
      { path: ROUTES.portal, element: <PortalHomePage /> },
      { path: ROUTES.portalRental, element: <PortalRentalDetailPage /> },
    ],
  },
  {
    element: <RequireAuth realm="gestao" />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.vehicles, element: <VehiclesPage /> },
      { path: ROUTES.vehicleNew, element: <VehicleNewPage /> },
      { path: ROUTES.vehicleDetail, element: <VehicleDetailPage /> },
      { path: ROUTES.vehicleEdit, element: <VehicleEditPage /> },
      { path: ROUTES.maintenances, element: <MaintenancesPage /> },
      { path: ROUTES.maintenanceDetail, element: <MaintenanceDetailPage /> },
      { path: ROUTES.inspections, element: <InspectionsPage /> },
      { path: ROUTES.inspectionDetail, element: <InspectionDetailPage /> },
      { path: ROUTES.rentals, element: <RentalsPage /> },
      { path: ROUTES.rentalDetail, element: <RentalDetailPage /> },
      { path: ROUTES.customers, element: <CustomersPage /> },
      { path: ROUTES.customerDetail, element: <CustomerDetailPage /> },
      { path: ROUTES.crm, element: <CrmPage /> },
      { path: ROUTES.leadDetail, element: <LeadDetailPage /> },
      { path: ROUTES.reimbursements, element: <ReimbursementsPage /> },
      { path: ROUTES.suppliers, element: <SuppliersPage /> },
      { path: ROUTES.supplierDetail, element: <SupplierDetailPage /> },
      { path: ROUTES.finance, element: <FinancePage /> },
      { path: ROUTES.financeStatement, element: <FinanceStatementPage /> },
      { path: ROUTES.financeDebts, element: <FinanceDebtsPage /> },
      { path: ROUTES.debtDetail, element: <DebtDetailPage /> },
    ],
  },
  { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
