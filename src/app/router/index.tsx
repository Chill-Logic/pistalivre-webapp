import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  CompanyPage,
  ContractTemplateDetailPage,
  CrmPage,
  CustomerDetailPage,
  CustomerLoginPage,
  CustomersPage,
  DashboardPage,
  DebtDetailPage,
  DocumentsPage,
  FinanceDebtsPage,
  FinancePage,
  FinanceStatementPage,
  LeadDetailPage,
  ModelsContractsPage,
  ModelsInspectionPage,
  PlansPage,
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
  UserDetailPage,
  UsersPage,
  RentalsPage,
  VehicleDetailPage,
  VehicleEditPage,
  VehicleNewPage,
  VehiclesPage,
} from "./pages";
import { ROUTES } from "@/constants/routes";
import { ComingSoonPage } from "@/pages/comum/coming-soon";
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
      { path: ROUTES.documents, element: <DocumentsPage /> },
      { path: ROUTES.plans, element: <PlansPage /> },
      { path: ROUTES.proposals, element: <ComingSoonPage title="Propostas" /> },
      {
        path: ROUTES.projections,
        element: <ComingSoonPage title="Projeções" />,
      },
      {
        path: ROUTES.signatures,
        element: <ComingSoonPage title="Assinaturas" />,
      },
      { path: ROUTES.models, element: <ModelsContractsPage /> },
      { path: ROUTES.modelsInspection, element: <ModelsInspectionPage /> },
      {
        path: ROUTES.contractTemplate,
        element: <ContractTemplateDetailPage />,
      },
      { path: ROUTES.users, element: <UsersPage /> },
      { path: ROUTES.userDetail, element: <UserDetailPage /> },
      { path: ROUTES.company, element: <CompanyPage /> },
      { path: ROUTES.finance, element: <FinancePage /> },
      { path: ROUTES.financeStatement, element: <FinanceStatementPage /> },
      { path: ROUTES.financeDebts, element: <FinanceDebtsPage /> },
      { path: ROUTES.debtDetail, element: <DebtDetailPage /> },
    ],
  },
  { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
