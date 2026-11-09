import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { RedirectIfAuthenticated } from "./guards/RedirectIfAuthenticated";
import { RequireAuth } from "./guards/RequireAuth";
import {
  CompanyEditPage,
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
  AiConsentPage,
  AiUsagePage,
  AuditGapsPage,
  AuditPage,
  AuditSectionPage,
  IntegrationsAppsPage,
  IntegrationsPage,
  IntegrationsPermissionsPage,
  IntegrationsSectionPage,
  FinanceBillsPage,
  FinanceDebtsPage,
  FinancePage,
  FinanceSectionPage,
  FinanceStatementPage,
  LeadDetailPage,
  LeadNewPage,
  ModelsContractsPage,
  ModelsInspectionPage,
  ModelsProposalsPage,
  ModelsSectionPage,
  ProposalTemplateEditPage,
  ProposalTemplateNewPage,
  CrmLinksPage,
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
  PartnersPage,
  PartnerNewPage,
  PartnerDetailPage,
  PartnerEditPage,
  PartnerContractPage,
  PartnerHomePage,
  PartnerLoginPage,
  PartnerProfilePage,
  PartnerRentalPage,
  PartnerVehiclePage,
  PartnerVehiclesPage,
  PartnerRentalsPage,
} from "./pages";
import {
  HOST_REALM,
  LEGACY_ROUTES,
  REALM_PREFIX,
  ROUTES,
  routeTo,
} from "@/constants/routes";
import { LegacyRedirect } from "@/components/molecules/legacy-redirect";
import { RealmPrefixRedirect } from "@/components/molecules/realm-prefix-redirect";
import { LoginPage } from "@/pages/gestao/login";
import { NotFoundPage } from "@/pages/comum/not-found";
import type { Realm } from "@/types/auth";

/** Partner area: read only, the partner's motorcycles and their rentals. */
const partnerRoutes: RouteObject[] = [
  {
    element: <RedirectIfAuthenticated realm="parceiro" />,
    children: [
      { path: ROUTES.partnerAreaLogin, element: <PartnerLoginPage /> },
    ],
  },
  {
    element: <RequireAuth realm="parceiro" />,
    children: [
      { path: ROUTES.partnerArea, element: <PartnerHomePage /> },
      { path: ROUTES.partnerAreaVehicles, element: <PartnerVehiclesPage /> },
      { path: ROUTES.partnerAreaVehicle, element: <PartnerVehiclePage /> },
      { path: ROUTES.partnerAreaRentals, element: <PartnerRentalsPage /> },
      { path: ROUTES.partnerAreaRental, element: <PartnerRentalPage /> },
      { path: ROUTES.partnerAreaProfile, element: <PartnerProfilePage /> },
    ],
  },
];

const portalRoutes: RouteObject[] = [
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
];

const gestaoRoutes: RouteObject[] = [
  {
    element: <RedirectIfAuthenticated realm="gestao" />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
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
      { path: ROUTES.inspectionPick, element: <InspectionNewPage /> },
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
      { path: ROUTES.crmLinks, element: <CrmLinksPage /> },
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
      { path: ROUTES.partners, element: <PartnersPage /> },
      { path: ROUTES.partnerNew, element: <PartnerNewPage /> },
      { path: ROUTES.partnerContract, element: <PartnerContractPage /> },
      { path: ROUTES.partnerDetail, element: <PartnerDetailPage /> },
      { path: ROUTES.partnerEdit, element: <PartnerEditPage /> },
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
              ModelsProposalsPage.preload,
              ModelsInspectionPage.preload,
            ]}
          />
        ),
        children: [
          { path: ROUTES.models, element: <ModelsContractsPage /> },
          { path: ROUTES.modelsProposals, element: <ModelsProposalsPage /> },
          { path: ROUTES.modelsInspection, element: <ModelsInspectionPage /> },
        ],
      },
      {
        path: ROUTES.proposalTemplateNew,
        element: <ProposalTemplateNewPage />,
      },
      {
        path: ROUTES.proposalTemplateEdit,
        element: <ProposalTemplateEditPage />,
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
      { path: ROUTES.companyEdit, element: <CompanyEditPage /> },
      { path: ROUTES.aiUsage, element: <AiUsagePage /> },
      {
        element: (
          <AuditSectionPage
            preload={[AuditPage.preload, AuditGapsPage.preload]}
          />
        ),
        children: [
          { path: ROUTES.audit, element: <AuditPage /> },
          { path: ROUTES.auditGaps, element: <AuditGapsPage /> },
        ],
      },
      { path: ROUTES.aiConsent, element: <AiConsentPage /> },
      {
        element: (
          <IntegrationsSectionPage
            preload={[
              IntegrationsPage.preload,
              IntegrationsPermissionsPage.preload,
              IntegrationsAppsPage.preload,
            ]}
          />
        ),
        children: [
          { path: ROUTES.integrations, element: <IntegrationsPage /> },
          {
            path: ROUTES.integrationsPermissions,
            element: <IntegrationsPermissionsPage />,
          },
          { path: ROUTES.integrationsApps, element: <IntegrationsAppsPage /> },
        ],
      },
      {
        element: (
          <FinanceSectionPage
            preload={[
              FinancePage.preload,
              FinanceBillsPage.preload,
              FinanceDebtsPage.preload,
              FinanceStatementPage.preload,
            ]}
          />
        ),
        children: [
          { path: ROUTES.finance, element: <FinancePage /> },
          { path: ROUTES.financeStatement, element: <FinanceStatementPage /> },
          { path: ROUTES.financeDebts, element: <FinanceDebtsPage /> },
          { path: ROUTES.financeBills, element: <FinanceBillsPage /> },
        ],
      },
      { path: ROUTES.debtNew, element: <DebtNewPage /> },
      { path: ROUTES.debtDetail, element: <DebtDetailPage /> },
      { path: ROUTES.debtEdit, element: <DebtEditPage /> },
    ],
  },
];

/** Addresses still carrying an area prefix, on an area's own domain. */
const prefixRedirects = (["gestao", "cliente", "parceiro"] as Realm[]).flatMap(
  (realm) =>
    [REALM_PREFIX[realm], `${REALM_PREFIX[realm]}/*`].map((path) => ({
      path,
      element: <RealmPrefixRedirect realm={realm} />,
    })),
);

/**
 * An area's own domain registers only that area, without prefix (its home is
 * the root) and redirects the prefixed addresses; any other host serves every
 * area with its prefix, the root opening the staff area.
 */
function routesForHost(realm: Realm | null): RouteObject[] {
  if (realm === "gestao") return [...gestaoRoutes, ...prefixRedirects];
  if (realm === "cliente") return [...portalRoutes, ...prefixRedirects];
  if (realm === "parceiro") return [...partnerRoutes, ...prefixRedirects];
  return [
    ...gestaoRoutes,
    ...portalRoutes,
    ...partnerRoutes,
    {
      path: ROUTES.root,
      element: <Navigate to={ROUTES.dashboard} replace />,
    },
  ];
}

export const router = createBrowserRouter([
  ...routesForHost(HOST_REALM),
  { path: "*", element: <NotFoundPage /> },
]);
