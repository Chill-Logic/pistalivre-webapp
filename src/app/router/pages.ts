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
export const InspectionNewPage = lazyPage(
  () => import("@/pages/gestao/inspection-new"),
  "InspectionNewPage",
);
export const CustomerLoginPage = lazyPage(
  () => import("@/pages/cliente/login"),
  "CustomerLoginPage",
);
export const PortalHomePage = lazyPage(
  () => import("@/pages/cliente/home"),
  "PortalHomePage",
);
export const PortalRentalStatementPage = lazyPage(
  () => import("@/pages/cliente/rental-statement"),
  "PortalRentalStatementPage",
);
export const RentalStatementPage = lazyPage(
  () => import("@/pages/gestao/rental-statement"),
  "RentalStatementPage",
);
export const RentalCustomerViewPage = lazyPage(
  () => import("@/pages/gestao/rental-customer-view"),
  "RentalCustomerViewPage",
);
export const PortalRentalDetailPage = lazyPage(
  () => import("@/pages/cliente/rental-detail"),
  "PortalRentalDetailPage",
);
export const PortalInspectionNewPage = lazyPage(
  () => import("@/pages/cliente/inspection-new"),
  "PortalInspectionNewPage",
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
export const AuditPage = lazyPage(
  () => import("@/pages/gestao/audit"),
  "AuditPage",
);
export const AuditGapsPage = lazyPage(
  () => import("@/pages/gestao/audit-gaps"),
  "AuditGapsPage",
);
export const AuditSectionPage = lazyPage(
  () => import("@/pages/gestao/audit-section"),
  "AuditSectionPage",
);
export const IntegrationsSectionPage = lazyPage(
  () => import("@/pages/gestao/integrations-section"),
  "IntegrationsSectionPage",
);
export const IntegrationsPage = lazyPage(
  () => import("@/pages/gestao/integrations"),
  "IntegrationsPage",
);
export const IntegrationsPermissionsPage = lazyPage(
  () => import("@/pages/gestao/integrations-permissions"),
  "IntegrationsPermissionsPage",
);
export const IntegrationsAppsPage = lazyPage(
  () => import("@/pages/gestao/integrations-apps"),
  "IntegrationsAppsPage",
);
export const AiConsentPage = lazyPage(
  () => import("@/pages/gestao/ai-consent"),
  "AiConsentPage",
);
export const AiUsagePage = lazyPage(
  () => import("@/pages/gestao/ai-usage"),
  "AiUsagePage",
);
export const FinanceBillsPage = lazyPage(
  () => import("@/pages/gestao/finance-bills"),
  "FinanceBillsPage",
);
export const FinanceDebtsPage = lazyPage(
  () => import("@/pages/gestao/finance-debts"),
  "FinanceDebtsPage",
);
export const DebtDetailPage = lazyPage(
  () => import("@/pages/gestao/debt-detail"),
  "DebtDetailPage",
);
export const ReimbursementsPage = lazyPage(
  () => import("@/pages/gestao/reimbursements"),
  "ReimbursementsPage",
);
export const SuppliersPage = lazyPage(
  () => import("@/pages/gestao/suppliers"),
  "SuppliersPage",
);
export const SupplierDetailPage = lazyPage(
  () => import("@/pages/gestao/supplier-detail"),
  "SupplierDetailPage",
);
export const SupplierNewPage = lazyPage(
  () => import("@/pages/gestao/supplier-new"),
  "SupplierNewPage",
);
export const SupplierEditPage = lazyPage(
  () => import("@/pages/gestao/supplier-edit"),
  "SupplierEditPage",
);
export const CrmPage = lazyPage(() => import("@/pages/gestao/crm"), "CrmPage");
export const LeadNewPage = lazyPage(
  () => import("@/pages/gestao/lead-new"),
  "LeadNewPage",
);
export const LeadDetailPage = lazyPage(
  () => import("@/pages/gestao/lead-detail"),
  "LeadDetailPage",
);
export const UsersPage = lazyPage(
  () => import("@/pages/gestao/users"),
  "UsersPage",
);
export const UserDetailPage = lazyPage(
  () => import("@/pages/gestao/user-detail"),
  "UserDetailPage",
);
export const CompanyPage = lazyPage(
  () => import("@/pages/gestao/company"),
  "CompanyPage",
);
export const CompanyEditPage = lazyPage(
  () => import("@/pages/gestao/company-edit"),
  "CompanyEditPage",
);
export const PlansPage = lazyPage(
  () => import("@/pages/gestao/plans"),
  "PlansPage",
);
export const PlanNewPage = lazyPage(
  () => import("@/pages/gestao/plan-new"),
  "PlanNewPage",
);
export const PlanEditPage = lazyPage(
  () => import("@/pages/gestao/plan-edit"),
  "PlanEditPage",
);
export const ModelsContractsPage = lazyPage(
  () => import("@/pages/gestao/models-contracts"),
  "ModelsContractsPage",
);
export const ModelsInspectionPage = lazyPage(
  () => import("@/pages/gestao/models-inspection"),
  "ModelsInspectionPage",
);
export const ContractTemplateDetailPage = lazyPage(
  () => import("@/pages/gestao/contract-template-detail"),
  "ContractTemplateDetailPage",
);
export const DocumentsPage = lazyPage(
  () => import("@/pages/gestao/documents"),
  "DocumentsPage",
);
export const CustomerNewPage = lazyPage(
  () => import("@/pages/gestao/customer-new"),
  "CustomerNewPage",
);
export const CustomerEditPage = lazyPage(
  () => import("@/pages/gestao/customer-edit"),
  "CustomerEditPage",
);
export const DebtNewPage = lazyPage(
  () => import("@/pages/gestao/debt-new"),
  "DebtNewPage",
);
export const DebtEditPage = lazyPage(
  () => import("@/pages/gestao/debt-edit"),
  "DebtEditPage",
);
export const RentalNewPage = lazyPage(
  () => import("@/pages/gestao/rental-new"),
  "RentalNewPage",
);
export const RentalEditPage = lazyPage(
  () => import("@/pages/gestao/rental-edit"),
  "RentalEditPage",
);
export const ModelsSectionPage = lazyPage(
  () => import("@/pages/gestao/models-section"),
  "ModelsSectionPage",
);
export const FinanceSectionPage = lazyPage(
  () => import("@/pages/gestao/finance-section"),
  "FinanceSectionPage",
);
export const MaintenanceNewPage = lazyPage(
  () => import("@/pages/gestao/maintenance-new"),
  "MaintenanceNewPage",
);
export const MaintenanceEditPage = lazyPage(
  () => import("@/pages/gestao/maintenance-edit"),
  "MaintenanceEditPage",
);
export const ContractTemplateNewPage = lazyPage(
  () => import("@/pages/gestao/contract-template-new"),
  "ContractTemplateNewPage",
);
export const ContractTemplateEditPage = lazyPage(
  () => import("@/pages/gestao/contract-template-edit"),
  "ContractTemplateEditPage",
);
export const UserNewPage = lazyPage(
  () => import("@/pages/gestao/user-new"),
  "UserNewPage",
);
export const UserEditPage = lazyPage(
  () => import("@/pages/gestao/user-edit"),
  "UserEditPage",
);
export const ProjectionsPage = lazyPage(
  () => import("@/pages/gestao/projections"),
  "ProjectionsPage",
);
export const ProposalsPage = lazyPage(
  () => import("@/pages/gestao/proposals"),
  "ProposalsPage",
);
export const ProposalNewPage = lazyPage(
  () => import("@/pages/gestao/proposal-new"),
  "ProposalNewPage",
);
export const ProposalDetailPage = lazyPage(
  () => import("@/pages/gestao/proposal-detail"),
  "ProposalDetailPage",
);
export const SignaturesPage = lazyPage(
  () => import("@/pages/gestao/signatures"),
  "SignaturesPage",
);
export const SignatureLinkPage = lazyPage(
  () => import("@/pages/gestao/signature-link"),
  "SignatureLinkPage",
);
export const SignatureDetailPage = lazyPage(
  () => import("@/pages/gestao/signature-detail"),
  "SignatureDetailPage",
);
export const RentalContractNewPage = lazyPage(
  () => import("@/pages/gestao/rental-contract-new"),
  "RentalContractNewPage",
);
export const ModelsProposalsPage = lazyPage(
  () => import("@/pages/gestao/models-proposals"),
  "ModelsProposalsPage",
);
export const ProposalTemplateNewPage = lazyPage(
  () => import("@/pages/gestao/proposal-template-new"),
  "ProposalTemplateNewPage",
);
export const ProposalTemplateEditPage = lazyPage(
  () => import("@/pages/gestao/proposal-template-edit"),
  "ProposalTemplateEditPage",
);
export const CrmLinksPage = lazyPage(
  () => import("@/pages/gestao/crm-links"),
  "CrmLinksPage",
);
export const PartnersPage = lazyPage(
  () => import("@/pages/gestao/partners"),
  "PartnersPage",
);
export const PartnerNewPage = lazyPage(
  () => import("@/pages/gestao/partner-new"),
  "PartnerNewPage",
);
export const PartnerDetailPage = lazyPage(
  () => import("@/pages/gestao/partner-detail"),
  "PartnerDetailPage",
);
export const PartnerEditPage = lazyPage(
  () => import("@/pages/gestao/partner-edit"),
  "PartnerEditPage",
);
export const PartnerContractPage = lazyPage(
  () => import("@/pages/gestao/partner-contract"),
  "PartnerContractPage",
);
export const PartnerContractDocumentPage = lazyPage(
  () => import("@/pages/gestao/partner-contract-document"),
  "PartnerContractDocumentPage",
);
export const PartnerLoginPage = lazyPage(
  () => import("@/pages/parceiro/login"),
  "PartnerLoginPage",
);
export const PartnerHomePage = lazyPage(
  () => import("@/pages/parceiro/home"),
  "PartnerHomePage",
);
export const PartnerVehiclePage = lazyPage(
  () => import("@/pages/parceiro/vehicle-detail"),
  "PartnerVehiclePage",
);
export const PartnerVehiclesPage = lazyPage(
  () => import("@/pages/parceiro/vehicles"),
  "PartnerVehiclesPage",
);
export const PartnerRentalsPage = lazyPage(
  () => import("@/pages/parceiro/rentals"),
  "PartnerRentalsPage",
);
export const PartnerRentalPage = lazyPage(
  () => import("@/pages/parceiro/rental-detail"),
  "PartnerRentalPage",
);
export const PartnerRentalStatementPage = lazyPage(
  () => import("@/pages/parceiro/rental-statement"),
  "PartnerRentalStatementPage",
);
export const PartnerProfilePage = lazyPage(
  () => import("@/pages/parceiro/profile"),
  "PartnerProfilePage",
);
