/**
 * Public URLs (Portuguese, as in the product), split by area like the pages:
 * /gestao for staff and /area-cliente for the customer portal. Keep every
 * path here.
 */
const GESTAO = "/gestao";

export const ROUTES = {
  root: "/",
  login: `${GESTAO}/entrar`,
  dashboard: GESTAO,
  vehicles: `${GESTAO}/veiculos`,
  vehicleDetail: `${GESTAO}/veiculos/:id`,
  rentals: `${GESTAO}/locacoes`,
  rentalDetail: `${GESTAO}/locacoes/:id`,
  customers: `${GESTAO}/clientes`,
  finance: `${GESTAO}/financeiro`,
} as const;

/** Concrete URLs for routes with params. */
export const routeTo = {
  vehicle: (id: string) => `${ROUTES.vehicles}/${id}`,
  rental: (id: string) => `${ROUTES.rentals}/${id}`,
};
