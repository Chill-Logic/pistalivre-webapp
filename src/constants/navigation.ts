import {
  Building2,
  Car,
  ClipboardCheck,
  FileSignature,
  FileText,
  HandCoins,
  Handshake,
  LayoutDashboard,
  Megaphone,
  PenLine,
  Receipt,
  ScrollText,
  Tags,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Wrench,
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
const VEHICLES: NavItem = { label: "Veículos", to: ROUTES.vehicles, icon: Car };
const CUSTOMERS: NavItem = {
  label: "Clientes",
  to: ROUTES.customers,
  icon: UserRound,
};
const RENTALS: NavItem = {
  label: "Locações",
  to: ROUTES.rentals,
  icon: FileSignature,
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

/** Sidebar and drawer: the same items, order and icons as the management app. */
export const SIDEBAR_NAV: NavItem[] = [
  DASHBOARD,
  VEHICLES,
  CUSTOMERS,
  { label: "CRM", to: ROUTES.crm, icon: Megaphone },
  { label: "Planos", to: ROUTES.plans, icon: Tags },
  { label: "Propostas", to: ROUTES.proposals, icon: Handshake },
  RENTALS,
  { label: "Modelos", to: ROUTES.models, icon: ScrollText },
  { label: "Vistorias", to: ROUTES.inspections, icon: ClipboardCheck },
  { label: "Manutenções", to: ROUTES.maintenances, icon: Wrench },
  { label: "Fornecedores", to: ROUTES.suppliers, icon: Receipt },
  FINANCE,
  { label: "Projeções", to: ROUTES.projections, icon: TrendingUp },
  { label: "Reembolsos", to: ROUTES.reimbursements, icon: HandCoins },
  { label: "Assinaturas", to: ROUTES.signatures, icon: PenLine },
  { label: "Documentos", to: ROUTES.documents, icon: FileText },
  { label: "Empresa", to: ROUTES.company, icon: Building2 },
  { label: "Usuários", to: ROUTES.users, icon: Users },
];
