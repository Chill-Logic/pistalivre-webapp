import {
  CarFront,
  ClipboardCheck,
  HandCoins,
  FileCog,
  Tags,
  Building2,
  UserCog,
  Target,
  Store,
  FileText,
  LayoutDashboard,
  Users,
  Wrench,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const DASHBOARD: NavItem = {
  label: "Painel",
  to: ROUTES.dashboard,
  icon: LayoutDashboard,
};
const VEHICLES: NavItem = {
  label: "Veículos",
  to: ROUTES.vehicles,
  icon: CarFront,
};
const RENTALS: NavItem = {
  label: "Locações",
  to: ROUTES.rentals,
  icon: FileText,
};
const CUSTOMERS: NavItem = {
  label: "Clientes",
  to: ROUTES.customers,
  icon: Users,
};
const FINANCE: NavItem = {
  label: "Financeiro",
  to: ROUTES.finance,
  icon: Wallet,
};

/** Mobile bottom bar: only the five daily destinations fit. */
export const MAIN_NAV: NavItem[] = [
  DASHBOARD,
  VEHICLES,
  RENTALS,
  CUSTOMERS,
  FINANCE,
];

/** Sidebar and drawer: everything, the fleet operation next to vehicles. */
export const SIDEBAR_NAV: NavItem[] = [
  DASHBOARD,
  VEHICLES,
  { label: "Manutenções", to: ROUTES.maintenances, icon: Wrench },
  { label: "Vistorias", to: ROUTES.inspections, icon: ClipboardCheck },
  RENTALS,
  CUSTOMERS,
  { label: "CRM", to: ROUTES.crm, icon: Target },
  { label: "Planos", to: ROUTES.plans, icon: Tags },
  { label: "Fornecedores", to: ROUTES.suppliers, icon: Store },
  FINANCE,
  { label: "Reembolsos", to: ROUTES.reimbursements, icon: HandCoins },
  { label: "Modelos", to: ROUTES.models, icon: FileCog },
  { label: "Usuários", to: ROUTES.users, icon: UserCog },
  { label: "Empresa", to: ROUTES.company, icon: Building2 },
];
