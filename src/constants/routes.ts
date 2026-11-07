/** Public URLs (Portuguese, as in the product). Keep every path here. */
export const ROUTES = {
  login: "/entrar",
  dashboard: "/",
  vehicles: "/veiculos",
  vehicleDetail: "/veiculos/:id",
  rentals: "/locacoes",
  customers: "/clientes",
  finance: "/financeiro",
} as const;

/** Concrete URLs for routes with params. */
export const routeTo = {
  vehicle: (id: string) => `${ROUTES.vehicles}/${id}`,
};
