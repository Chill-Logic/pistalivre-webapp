/**
 * Public URLs (Portuguese, as in the product), split by area like the pages:
 * /gestao for staff and /area-cliente for the customer portal. Keep every
 * path here.
 */
const GESTAO = "/gestao";
const PORTAL = "/area-cliente";

export const ROUTES = {
  root: "/",
  login: `${GESTAO}/entrar`,
  dashboard: GESTAO,
  vehicles: `${GESTAO}/veiculos`,
  vehicleNew: `${GESTAO}/veiculos/novo`,
  vehicleDetail: `${GESTAO}/veiculos/:id`,
  vehicleEdit: `${GESTAO}/veiculos/:id/editar`,
  rentals: `${GESTAO}/locacoes`,
  rentalDetail: `${GESTAO}/locacoes/:id`,
  customers: `${GESTAO}/clientes`,
  customerDetail: `${GESTAO}/clientes/:id`,
  maintenances: `${GESTAO}/manutencoes`,
  maintenanceDetail: `${GESTAO}/manutencoes/:id`,
  inspections: `${GESTAO}/vistorias`,
  inspectionDetail: `${GESTAO}/vistorias/:id`,
  crm: `${GESTAO}/crm`,
  leadDetail: `${GESTAO}/crm/:id`,
  reimbursements: `${GESTAO}/reembolsos`,
  suppliers: `${GESTAO}/fornecedores`,
  supplierDetail: `${GESTAO}/fornecedores/:id`,
  plans: `${GESTAO}/planos`,
  models: `${GESTAO}/modelos`,
  contractTemplate: `${GESTAO}/modelos/contratos/:id`,
  modelsInspection: `${GESTAO}/modelos/vistoria`,
  users: `${GESTAO}/usuarios`,
  userDetail: `${GESTAO}/usuarios/:id`,
  company: `${GESTAO}/empresa`,
  finance: `${GESTAO}/financeiro`,
  financeDebts: `${GESTAO}/financeiro/debitos`,
  debtDetail: `${GESTAO}/financeiro/debitos/:id`,
  financeStatement: `${GESTAO}/financeiro/extrato`,
  portal: PORTAL,
  portalLogin: `${PORTAL}/entrar`,
  portalRental: `${PORTAL}/locacoes/:id`,
} as const;

/** Concrete URLs for routes with params. */
export const routeTo = {
  vehicle: (id: string) => `${ROUTES.vehicles}/${id}`,
  editVehicle: (id: string) => `${ROUTES.vehicles}/${id}/editar`,
  rental: (id: string) => `${ROUTES.rentals}/${id}`,
  customer: (id: string) => `${ROUTES.customers}/${id}`,
  debt: (id: string) => `${ROUTES.financeDebts}/${id}`,
  supplier: (id: string) => `${ROUTES.suppliers}/${id}`,
  lead: (id: string) => `${ROUTES.crm}/${id}`,
  user: (id: string) => `${ROUTES.users}/${id}`,
  contractTemplate: (id: string) => `${ROUTES.models}/contratos/${id}`,
  maintenance: (id: string) => `${ROUTES.maintenances}/${id}`,
  inspection: (id: string) => `${ROUTES.inspections}/${id}`,
  portalRental: (id: string) => `${ROUTES.portal}/locacoes/${id}`,
};
