import type { Realm } from "@/types/auth";
import { realmOfHostname } from "@/utils/host-label";

/**
 * Public URLs (Portuguese, as in the product), split by area like the pages:
 * /gestao for staff and /area-cliente for the customer portal. On an area's
 * own domain (app.gestao.…, app.cliente.…) the domain already says the area,
 * so its prefix is dropped (app.gestao.…/locacoes); hosts that serve both
 * areas (localhost, the Vercel address) keep both prefixes. Keep every path
 * here.
 */
export const REALM_PREFIX: Record<Realm, string> = {
  gestao: "/gestao",
  cliente: "/area-cliente",
};

/** Area of the current domain (null = serves both). Fixed for the page load. */
export const HOST_REALM =
  typeof window === "undefined"
    ? null
    : realmOfHostname(window.location.hostname);

const GESTAO = HOST_REALM === "gestao" ? "" : REALM_PREFIX.gestao;
const PORTAL = HOST_REALM === "cliente" ? "" : REALM_PREFIX.cliente;

export const ROUTES = {
  root: "/",
  login: `${GESTAO}/entrar`,
  dashboard: GESTAO || "/",
  vehicles: `${GESTAO}/veiculos`,
  vehicleNew: `${GESTAO}/veiculos/novo`,
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
  finance: `${GESTAO}/financeiro`,
  financeDebts: `${GESTAO}/financeiro/debitos`,
  debtNew: `${GESTAO}/financeiro/debitos/nova`,
  debtDetail: `${GESTAO}/financeiro/debitos/:id`,
  debtEdit: `${GESTAO}/financeiro/debitos/:id/editar`,
  financeStatement: `${GESTAO}/financeiro/extrato`,
  portal: PORTAL || "/",
  portalLogin: `${PORTAL}/entrar`,
  portalRental: `${PORTAL}/locacoes/:id`,
  portalInspectionNew: `${PORTAL}/locacoes/:id/vistorias/nova`,
  portalRentalStatement: `${PORTAL}/locacoes/:id/extrato`,
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
  portalRentalStatement: (id: string) => `${PORTAL}/locacoes/${id}/extrato`,
  portalInspectionNew: (id: string) =>
    `${PORTAL}/locacoes/${id}/vistorias/nova`,
};
