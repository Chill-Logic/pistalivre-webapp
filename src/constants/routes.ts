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
  rentalNew: `${GESTAO}/locacoes/nova`,
  rentalDetail: `${GESTAO}/locacoes/:id`,
  rentalEdit: `${GESTAO}/locacoes/:id/editar`,
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
  suppliers: `${GESTAO}/fornecedores`,
  supplierNew: `${GESTAO}/fornecedores/novo`,
  supplierDetail: `${GESTAO}/fornecedores/:id`,
  supplierEdit: `${GESTAO}/fornecedores/:id/editar`,
  documents: `${GESTAO}/documentos`,
  plans: `${GESTAO}/planos`,
  planNew: `${GESTAO}/planos/novo`,
  planEdit: `${GESTAO}/planos/:id/editar`,
  proposals: `${GESTAO}/propostas`,
  projections: `${GESTAO}/projecoes`,
  signatures: `${GESTAO}/assinaturas`,
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
  editRental: (id: string) => `${ROUTES.rentals}/${id}/editar`,
  customer: (id: string) => `${ROUTES.customers}/${id}`,
  editCustomer: (id: string) => `${ROUTES.customers}/${id}/editar`,
  newCustomerFromLead: (leadId: string) =>
    `${ROUTES.customers}/novo?lead=${encodeURIComponent(leadId)}`,
  debt: (id: string) => `${ROUTES.financeDebts}/${id}`,
  supplier: (id: string) => `${ROUTES.suppliers}/${id}`,
  editSupplier: (id: string) => `${ROUTES.suppliers}/${id}/editar`,
  lead: (id: string) => `${ROUTES.crm}/${id}`,
  editPlan: (id: string) => `${ROUTES.plans}/${id}/editar`,
  user: (id: string) => `${ROUTES.users}/${id}`,
  contractTemplate: (id: string) => `${ROUTES.models}/contratos/${id}`,
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
  portalRental: (id: string) => `${ROUTES.portal}/locacoes/${id}`,
};
