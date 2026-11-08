import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  CompanyPage,
  ContractTemplateDetailPage,
  ContractTemplateEditPage,
  ContractTemplateNewPage,
  CrmPage,
  CustomerDetailPage,
  CustomerEditPage,
  RentalEditPage,
  RentalNewPage,
  CustomerNewPage,
  CustomerLoginPage,
  CustomersPage,
  DashboardPage,
  DebtDetailPage,
  DebtEditPage,
  DebtNewPage,
  DocumentsPage,
  FinanceDebtsPage,
  FinancePage,
  FinanceSectionPage,
  FinanceStatementPage,
  LeadDetailPage,
  LeadNewPage,
  ModelsContractsPage,
  ModelsInspectionPage,
  ModelsSectionPage,
  PlansPage,
  ProjectionsPage,
  PlanEditPage,
  PlanNewPage,
  InspectionDetailPage,
  InspectionNewPage,
  InspectionsPage,
  MaintenanceDetailPage,
  MaintenanceEditPage,
  MaintenanceNewPage,
  MaintenancesPage,
  PortalHomePage,
  PortalRentalDetailPage,
  PortalRentalStatementPage,
  RentalStatementPage,
  RentalContractNewPage,
  RentalCustomerViewPage,
  PortalInspectionNewPage,
  ReimbursementsPage,
  RentalDetailPage,
  SupplierDetailPage,
  SupplierEditPage,
  SupplierNewPage,
  SuppliersPage,
  UserDetailPage,
  UserEditPage,
  UserNewPage,
  UsersPage,
  RentalsPage,
  VehicleDetailPage,
  VehicleEditPage,
  VehicleNewPage,
  VehiclesPage,
  ProposalsPage,
  ProposalDetailPage,
  ProposalNewPage,
  SignaturesPage,
  SignatureDetailPage,
  SignatureLinkPage,
} from "./pages";
import { LEGACY_ROUTES, ROUTES, routeTo } from "@/constants/routes";
import { LegacyRedirect } from "@/components/molecules/legacy-redirect";
import { hostRealm } from "@/helpers/host-realm";
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
      {
        path: ROUTES.portalRentalStatement,
        element: <PortalRentalStatementPage />,
      },
      {
        path: ROUTES.portalInspectionNew,
        element: <PortalInspectionNewPage />,
      },
      {
        path: LEGACY_ROUTES.portalPassword,
        element: <LegacyRedirect to={() => ROUTES.portal} />,
      },
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
      { path: ROUTES.inspectionNew, element: <InspectionNewPage /> },
      { path: ROUTES.maintenances, element: <MaintenancesPage /> },
      { path: ROUTES.maintenanceNew, element: <MaintenanceNewPage /> },
      { path: ROUTES.maintenanceDetail, element: <MaintenanceDetailPage /> },
      { path: ROUTES.maintenanceEdit, element: <MaintenanceEditPage /> },
      { path: ROUTES.inspections, element: <InspectionsPage /> },
      { path: ROUTES.inspectionDetail, element: <InspectionDetailPage /> },
      {
        path: LEGACY_ROUTES.vehicleInspection,
        element: (
          <LegacyRedirect
            to={({ inspectionId }) => routeTo.inspection(inspectionId ?? "")}
          />
        ),
      },
      { path: ROUTES.rentals, element: <RentalsPage /> },
      { path: ROUTES.rentalNew, element: <RentalNewPage /> },
      { path: ROUTES.rentalDetail, element: <RentalDetailPage /> },
      { path: ROUTES.rentalEdit, element: <RentalEditPage /> },
      { path: ROUTES.rentalStatement, element: <RentalStatementPage /> },
      { path: ROUTES.rentalContractNew, element: <RentalContractNewPage /> },
      {
        path: ROUTES.rentalCustomerView,
        element: <RentalCustomerViewPage />,
      },
      { path: ROUTES.customers, element: <CustomersPage /> },
      { path: ROUTES.customerNew, element: <CustomerNewPage /> },
      { path: ROUTES.customerDetail, element: <CustomerDetailPage /> },
      { path: ROUTES.customerEdit, element: <CustomerEditPage /> },
      { path: ROUTES.crm, element: <CrmPage /> },
      { path: ROUTES.leadNew, element: <LeadNewPage /> },
      { path: ROUTES.leadDetail, element: <LeadDetailPage /> },
      { path: ROUTES.reimbursements, element: <ReimbursementsPage /> },
      { path: ROUTES.suppliers, element: <SuppliersPage /> },
      { path: ROUTES.supplierNew, element: <SupplierNewPage /> },
      { path: ROUTES.supplierDetail, element: <SupplierDetailPage /> },
      { path: ROUTES.supplierEdit, element: <SupplierEditPage /> },
      {
        path: LEGACY_ROUTES.suppliers,
        element: (
          <LegacyRedirect
            to={({ "*": rest }) =>
              rest ? `${ROUTES.suppliers}/${rest}` : ROUTES.suppliers
            }
          />
        ),
      },
      { path: ROUTES.documents, element: <DocumentsPage /> },
      { path: ROUTES.plans, element: <PlansPage /> },
      { path: ROUTES.planNew, element: <PlanNewPage /> },
      { path: ROUTES.planEdit, element: <PlanEditPage /> },
      { path: ROUTES.proposals, element: <ProposalsPage /> },
      { path: ROUTES.proposalNew, element: <ProposalNewPage /> },
      { path: ROUTES.proposalDetail, element: <ProposalDetailPage /> },
      { path: ROUTES.projections, element: <ProjectionsPage /> },
      { path: ROUTES.signatures, element: <SignaturesPage /> },
      { path: ROUTES.signatureLink, element: <SignatureLinkPage /> },
      { path: ROUTES.signatureDetail, element: <SignatureDetailPage /> },
      {
        element: (
          <ModelsSectionPage
            preload={[
              ModelsContractsPage.preload,
              ModelsInspectionPage.preload,
            ]}
          />
        ),
        children: [
          { path: ROUTES.models, element: <ModelsContractsPage /> },
          { path: ROUTES.modelsInspection, element: <ModelsInspectionPage /> },
        ],
      },
      {
        path: ROUTES.contractTemplateNew,
        element: <ContractTemplateNewPage />,
      },
      {
        path: ROUTES.contractTemplate,
        element: <ContractTemplateDetailPage />,
      },
      {
        path: ROUTES.contractTemplateEdit,
        element: <ContractTemplateEditPage />,
      },
      { path: ROUTES.users, element: <UsersPage /> },
      { path: ROUTES.userNew, element: <UserNewPage /> },
      { path: ROUTES.userDetail, element: <UserDetailPage /> },
      { path: ROUTES.userEdit, element: <UserEditPage /> },
      { path: ROUTES.company, element: <CompanyPage /> },
      {
        element: (
          <FinanceSectionPage
            preload={[
              FinancePage.preload,
              FinanceDebtsPage.preload,
              FinanceStatementPage.preload,
            ]}
          />
        ),
        children: [
          { path: ROUTES.finance, element: <FinancePage /> },
          { path: ROUTES.financeStatement, element: <FinanceStatementPage /> },
          { path: ROUTES.financeDebts, element: <FinanceDebtsPage /> },
        ],
      },
      { path: ROUTES.debtNew, element: <DebtNewPage /> },
      { path: ROUTES.debtDetail, element: <DebtDetailPage /> },
      { path: ROUTES.debtEdit, element: <DebtEditPage /> },
    ],
  },
  {
    // Each domain opens its own area (gestao.* → staff, cliente.* → portal).
    path: ROUTES.root,
    element: (
      <Navigate
        to={hostRealm() === "cliente" ? ROUTES.portal : ROUTES.dashboard}
        replace
      />
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);
