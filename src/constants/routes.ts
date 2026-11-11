import type { Realm } from "@/types/auth";
import { isLandingHostname, realmOfHostname } from "@/utils/host-label";

/**
 * Public URLs (Portuguese, as in the product), split by area like the pages:
 * /gestao for staff, /area-cliente for the customer portal and /parceiro for
 * partners. On an area's own domain (app.gestao.…, app.cliente.…,
 * app.parceiro.…) the domain already says the area, so its prefix is dropped
 * (app.gestao.…/locacoes); hosts that serve every area (localhost, the Vercel
 * address) keep the prefixes. Keep every path here.
 */
export const REALM_PREFIX: Record<Realm, string> = {
  gestao: "/gestao",
  cliente: "/area-cliente",
  parceiro: "/parceiro",
};

/** The public site's domain: only the published landing is served there. */
export const IS_LANDING_HOST =
  typeof window !== "undefined" && isLandingHostname(window.location.hostname);

/** Area of the current domain (null = serves all). Fixed for the page load. */
export const HOST_REALM =
  typeof window === "undefined"
    ? null
    : realmOfHostname(window.location.hostname);

const GESTAO = HOST_REALM === "gestao" ? "" : REALM_PREFIX.gestao;
const PORTAL = HOST_REALM === "cliente" ? "" : REALM_PREFIX.cliente;
const PARTNER = HOST_REALM === "parceiro" ? "" : REALM_PREFIX.parceiro;

export const ROUTES = {
  root: "/",
  /** The published landing: the root of its own domain, /site elsewhere. */
  publicLanding: IS_LANDING_HOST ? "/" : "/site",
  login: `${GESTAO}/entrar`,
  dashboard: GESTAO || "/",
  vehicles: `${GESTAO}/veiculos`,
  vehicleNew: `${GESTAO}/veiculos/novo`,
  vehicleCatalog: `${GESTAO}/veiculos/catalogo`,
  vehicleCategories: `${GESTAO}/veiculos/categorias`,
  vehicleDetail: `${GESTAO}/veiculos/:id`,
  vehicleEdit: `${GESTAO}/veiculos/:id/editar`,
  inspectionNew: `${GESTAO}/veiculos/:id/vistorias/nova`,
  rentals: `${GESTAO}/locacoes`,
  rentalNew: `${GESTAO}/locacoes/nova`,
  rentalDetail: `${GESTAO}/locacoes/:id`,
  rentalEdit: `${GESTAO}/locacoes/:id/editar`,
  rentalStatement: `${GESTAO}/locacoes/:id/extrato`,
  rentalContractNew: `${GESTAO}/locacoes/:id/contrato/novo`,
  rentalCustomerView: `${GESTAO}/locacoes/:id/como-cliente`,
  customers: `${GESTAO}/clientes`,
  customerNew: `${GESTAO}/clientes/novo`,
  customerDetail: `${GESTAO}/clientes/:id`,
  customerEdit: `${GESTAO}/clientes/:id/editar`,
  maintenances: `${GESTAO}/manutencoes`,
  maintenanceNew: `${GESTAO}/manutencoes/nova`,
  maintenanceDetail: `${GESTAO}/manutencoes/:id`,
  maintenanceEdit: `${GESTAO}/manutencoes/:id/editar`,
  inspections: `${GESTAO}/vistorias`,
  inspectionPick: `${GESTAO}/vistorias/nova`,
  inspectionDetail: `${GESTAO}/vistorias/:id`,
  crm: `${GESTAO}/crm`,
  leadNew: `${GESTAO}/crm/novo`,
  leadDetail: `${GESTAO}/crm/:id`,
  reimbursements: `${GESTAO}/reembolsos`,
  suppliers: `${GESTAO}/custos-fixos`,
  supplierNew: `${GESTAO}/custos-fixos/novo`,
  supplierDetail: `${GESTAO}/custos-fixos/:id`,
  supplierEdit: `${GESTAO}/custos-fixos/:id/editar`,
  documents: `${GESTAO}/documentos`,
  document: `${GESTAO}/documentos/:id`,
  plans: `${GESTAO}/planos`,
  planNew: `${GESTAO}/planos/novo`,
  planEdit: `${GESTAO}/planos/:id/editar`,
  proposals: `${GESTAO}/propostas`,
  proposalNew: `${GESTAO}/propostas/nova`,
  proposalDetail: `${GESTAO}/propostas/:id`,
  projections: `${GESTAO}/projecoes`,
  signatures: `${GESTAO}/assinaturas`,
  signatureLink: `${GESTAO}/assinaturas/vincular`,
  signatureDetail: `${GESTAO}/assinaturas/:id`,
  models: `${GESTAO}/modelos`,
  contractTemplateNew: `${GESTAO}/modelos/contratos/novo`,
  contractTemplate: `${GESTAO}/modelos/contratos/:id`,
  contractTemplateEdit: `${GESTAO}/modelos/contratos/:id/editar`,
  modelsInspection: `${GESTAO}/modelos/vistoria`,
  modelsProposals: `${GESTAO}/modelos/propostas`,
  proposalTemplateNew: `${GESTAO}/modelos/propostas/novo`,
  proposalTemplateEdit: `${GESTAO}/modelos/propostas/:id/editar`,
  crmLinks: `${GESTAO}/crm/links`,
  users: `${GESTAO}/usuarios`,
  userNew: `${GESTAO}/usuarios/novo`,
  userDetail: `${GESTAO}/usuarios/:id`,
  userEdit: `${GESTAO}/usuarios/:id/editar`,
  company: `${GESTAO}/empresa`,
  companyEdit: `${GESTAO}/empresa/editar`,
  aiUsage: `${GESTAO}/empresa/uso-de-ia`,
  integrations: `${GESTAO}/integracoes`,
  integrationsPermissions: `${GESTAO}/integracoes/permissoes`,
  integrationsApps: `${GESTAO}/integracoes/aplicativos`,
  audit: `${GESTAO}/auditoria`,
  auditGaps: `${GESTAO}/auditoria/lacunas`,
  aiConsent: `${GESTAO}/autorizar-ia`,
  /** Files for the AI (an MCP client can't upload them): "Enviar documentos para a IA". */
  aiAttachments: `${GESTAO}/ia/anexos`,
  partners: `${GESTAO}/parceiros`,
  partnerNew: `${GESTAO}/parceiros/novo`,
  partnerDetail: `${GESTAO}/parceiros/:id`,
  partnerEdit: `${GESTAO}/parceiros/:id/editar`,
  partnerContract: `${GESTAO}/parceiros/contratos/:id`,
  partnerContractNew: `${GESTAO}/parceiros/:id/contratos/novo`,
  partnerContractEdit: `${GESTAO}/parceiros/contratos/:id/editar`,
  partnerContractDocument: `${GESTAO}/parceiros/contratos/:id/documento`,
  /** POC: landing editor (pistalivrelocacoes.com.br), draft only. */
  landingEditor: `${GESTAO}/site`,
  landingPreview: `${GESTAO}/site/previa`,
  finance: `${GESTAO}/financeiro`,
  financeDebts: `${GESTAO}/financeiro/debitos`,
  debtNew: `${GESTAO}/financeiro/debitos/nova`,
  debtDetail: `${GESTAO}/financeiro/debitos/:id`,
  debtEdit: `${GESTAO}/financeiro/debitos/:id/editar`,
  financeStatement: `${GESTAO}/financeiro/extrato`,
  financeBills: `${GESTAO}/financeiro/contas`,
  financeCards: `${GESTAO}/financeiro/cartoes`,
  portal: PORTAL || "/",
  portalLogin: `${PORTAL}/entrar`,
  /** Public (no login): lead capture and the questionnaire. */
  portalLeadCapture: `${PORTAL}/quero-alugar`,
  portalQuestionnaireStart: `${PORTAL}/questionario`,
  portalQuestionnaire: `${PORTAL}/questionario/:token`,
  portalRental: `${PORTAL}/locacoes/:id`,
  portalInspectionNew: `${PORTAL}/locacoes/:id/vistorias/nova`,
  portalRentalStatement: `${PORTAL}/locacoes/:id/extrato`,
  /** Partner area (app.parceiro): read only, the partner's vehicles. */
  partnerArea: PARTNER || "/",
  partnerAreaLogin: `${PARTNER}/entrar`,
  partnerAreaVehicles: `${PARTNER}/veiculos`,
  partnerAreaVehicle: `${PARTNER}/veiculos/:id`,
  partnerAreaRentals: `${PARTNER}/locacoes`,
  partnerAreaRental: `${PARTNER}/locacoes/:id`,
  partnerAreaRentalStatement: `${PARTNER}/locacoes/:id/extrato`,
  partnerAreaProfile: `${PARTNER}/perfil`,
} as const;

/** Addresses that moved: the old path keeps working (shared links). */
export const LEGACY_ROUTES = {
  suppliers: `${GESTAO}/fornecedores/*`,
  vehicleInspection: `${GESTAO}/veiculos/:id/vistorias/:inspectionId`,
  /** The Next had a password page; the SPA changes it from the header. */
  portalPassword: `${PORTAL}/senha`,
} as const;

/** Concrete URLs for routes with params. */
export const routeTo = {
  vehicle: (id: string) => `${ROUTES.vehicles}/${id}`,
  editVehicle: (id: string) => `${ROUTES.vehicles}/${id}/editar`,
  rental: (id: string) => `${ROUTES.rentals}/${id}`,
  rentalStatement: (id: string) => `${ROUTES.rentals}/${id}/extrato`,
  rentalCustomerView: (id: string) => `${ROUTES.rentals}/${id}/como-cliente`,
  editRental: (id: string) => `${ROUTES.rentals}/${id}/editar`,
  /** "Gerar contrato": `?modelo=` = the chosen template, `?cnh=editar`. */
  newRentalContract: (
    id: string,
    step: { templateId?: string; editLicense?: boolean } = {},
  ) => {
    const params = new URLSearchParams();
    if (step.templateId) params.set("modelo", step.templateId);
    if (step.editLicense) params.set("cnh", "editar");
    const query = params.toString();
    const path = `${ROUTES.rentals}/${id}/contrato/novo`;
    return query ? `${path}?${query}` : path;
  },
  customer: (id: string) => `${ROUTES.customers}/${id}`,
  editCustomer: (id: string) => `${ROUTES.customers}/${id}/editar`,
  newCustomerFromLead: (leadId: string) =>
    `${ROUTES.customers}/novo?lead=${encodeURIComponent(leadId)}`,
  debt: (id: string) => `${ROUTES.financeDebts}/${id}`,
  editDebt: (id: string) => `${ROUTES.financeDebts}/${id}/editar`,
  /** From a vehicle: the debt opens with it chosen. */
  newDebtForVehicle: (vehicleId: string) =>
    `${ROUTES.debtNew}?veiculo=${encodeURIComponent(vehicleId)}`,
  supplier: (id: string) => `${ROUTES.suppliers}/${id}`,
  editSupplier: (id: string) => `${ROUTES.suppliers}/${id}/editar`,
  lead: (id: string) => `${ROUTES.crm}/${id}`,
  partner: (id: string) => `${ROUTES.partners}/${id}`,
  editPartner: (id: string) => `${ROUTES.partners}/${id}/editar`,
  partnerContract: (id: string) => `${ROUTES.partners}/contratos/${id}`,
  newPartnerContract: (partnerId: string) =>
    `${ROUTES.partners}/${partnerId}/contratos/novo`,
  editPartnerContract: (id: string) =>
    `${ROUTES.partners}/contratos/${id}/editar`,
  partnerContractDocument: (id: string) =>
    `${ROUTES.partners}/contratos/${id}/documento`,
  editPlan: (id: string) => `${ROUTES.plans}/${id}/editar`,
  user: (id: string) => `${ROUTES.users}/${id}`,
  editUser: (id: string) => `${ROUTES.users}/${id}/editar`,
  contractTemplate: (id: string) => `${ROUTES.models}/contratos/${id}`,
  editContractTemplate: (id: string) =>
    `${ROUTES.models}/contratos/${id}/editar`,
  editProposalTemplate: (id: string) =>
    `${ROUTES.modelsProposals}/${id}/editar`,
  maintenance: (id: string) => `${ROUTES.maintenances}/${id}`,
  editMaintenance: (id: string) => `${ROUTES.maintenances}/${id}/editar`,
  /** From a vehicle or a rental (the vehicle comes fixed). */
  newMaintenance: (from: { vehicleId?: string; rentalId?: string } = {}) => {
    const params = new URLSearchParams();
    if (from.vehicleId) params.set("veiculo", from.vehicleId);
    if (from.rentalId) params.set("locacao", from.rentalId);
    const query = params.toString();
    return query
      ? `${ROUTES.maintenances}/nova?${query}`
      : `${ROUTES.maintenances}/nova`;
  },
  inspection: (id: string) => `${ROUTES.inspections}/${id}`,
  /** Of a vehicle; from a rental (`?locacao=`) the renter can be the author. */
  newInspection: (vehicleId: string, rentalId?: string) => {
    const path = `${ROUTES.vehicles}/${vehicleId}/vistorias/nova`;
    return rentalId ? `${path}?locacao=${encodeURIComponent(rentalId)}` : path;
  },
  proposal: (id: string) => `${ROUTES.proposals}/${id}`,
  signature: (id: string) => `${ROUTES.signatures}/${id}`,
  portalRental: (id: string) => `${PORTAL}/locacoes/${id}`,
  portalQuestionnaire: (token: string) =>
    `${PORTAL}/questionario/${encodeURIComponent(token)}`,
  portalRentalStatement: (id: string) => `${PORTAL}/locacoes/${id}/extrato`,
  portalInspectionNew: (id: string) =>
    `${PORTAL}/locacoes/${id}/vistorias/nova`,
  partnerAreaVehicle: (id: string) => `${PARTNER}/veiculos/${id}`,
  partnerAreaRental: (id: string) => `${PARTNER}/locacoes/${id}`,
  partnerAreaRentalStatement: (id: string) =>
    `${PARTNER}/locacoes/${id}/extrato`,
};
