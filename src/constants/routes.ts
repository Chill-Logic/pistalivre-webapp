/** Public URLs (Portuguese, as in the product). Keep every path here. */
export const ROUTES = {
  login: "/entrar",
  dashboard: "/",
  vehicles: "/veiculos",
  rentals: "/locacoes",
  customers: "/clientes",
  finance: "/financeiro",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
