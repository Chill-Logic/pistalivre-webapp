import {
  Banknote,
  Building2,
  CalendarDays,
  CreditCard,
  Scale,
  CarFront,
  ClipboardList,
  Landmark,
  Settings,
  Target,
  Car,
  BriefcaseBusiness,
  LayoutGrid,
  PanelsTopLeft,
  ClipboardCheck,
  FileSignature,
  FileText,
  HandCoins,
  Handshake,
  LayoutDashboard,
  Megaphone,
  PenLine,
  Plug,
  Receipt,
  ScrollText,
  ShieldCheck,
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
  /** Only administrators see it (the API answers 403 to agents anyway). */
  adminOnly?: boolean;
  /** Active only on this exact path (an area's home). */
  exact?: boolean;
  /** Paths under `to` that belong to another item (not active here). */
  except?: string[];
};

const DASHBOARD: NavItem = {
  label: "Painel",
  to: ROUTES.dashboard,
  icon: LayoutDashboard,
};
const VEHICLES: NavItem = {
  label: "Veículos",
  to: ROUTES.vehicles,
  icon: Car,
  except: [ROUTES.vehicleCatalog, ROUTES.vehicleCategories],
};
const CATALOG: NavItem = {
  label: "Catálogo",
  to: ROUTES.vehicleCatalog,
  icon: LayoutGrid,
};
const CATEGORIES: NavItem = {
  label: "Categorias",
  to: ROUTES.vehicleCategories,
  icon: Tags,
};
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

/**
 * Mobile bottom bar: four daily destinations; the fifth slot is "Menu", which
 * opens every destination (Financeiro included) in a bottom sheet.
 */
export const MAIN_NAV: NavItem[] = [DASHBOARD, VEHICLES, RENTALS, CUSTOMERS];

/** A collapsible section of the sidebar (Frota, Comercial…). */
export type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

/**
 * Sidebar and drawer: Painel on top, then the areas, each collapsible (the
 * list grew too long to scan flat).
 */
export const SIDEBAR_NAV: NavEntry[] = [
  DASHBOARD,
  {
    label: "Frota",
    icon: CarFront,
    items: [
      VEHICLES,
      CATALOG,
      CATEGORIES,
      { label: "Vistorias", to: ROUTES.inspections, icon: ClipboardCheck },
      { label: "Manutenções", to: ROUTES.maintenances, icon: Wrench },
    ],
  },
  {
    label: "Comercial",
    icon: Target,
    items: [
      { label: "CRM", to: ROUTES.crm, icon: Megaphone },
      { label: "Propostas", to: ROUTES.proposals, icon: Handshake },
      { label: "Planos", to: ROUTES.plans, icon: Tags },
      // The public site (pistalivrelocacoes.com.br), built from blocks.
      { label: "Site", to: ROUTES.landingEditor, icon: PanelsTopLeft },
    ],
  },
  {
    label: "Operação",
    icon: ClipboardList,
    items: [
      CUSTOMERS,
      RENTALS,
      { label: "Reembolsos", to: ROUTES.reimbursements, icon: HandCoins },
      { label: "Assinaturas", to: ROUTES.signatures, icon: PenLine },
      { label: "Parceiros", to: ROUTES.partners, icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Financeiro",
    icon: Landmark,
    items: [
      // The finance tabs, one by one: no "Financeiro › Financeiro".
      { label: "Visão geral", to: ROUTES.finance, icon: Wallet, exact: true },
      { label: "Contas do mês", to: ROUTES.financeBills, icon: CalendarDays },
      { label: "Débitos", to: ROUTES.financeDebts, icon: Scale },
      { label: "Extrato", to: ROUTES.financeStatement, icon: Banknote },
      { label: "Cartões", to: ROUTES.financeCards, icon: CreditCard },
      { label: "Custos fixos", to: ROUTES.suppliers, icon: Receipt },
      { label: "Projeções", to: ROUTES.projections, icon: TrendingUp },
    ],
  },
  {
    label: "Configurações",
    icon: Settings,
    items: [
      { label: "Empresa", to: ROUTES.company, icon: Building2 },
      { label: "Usuários", to: ROUTES.users, icon: Users },
      { label: "Integrações", to: ROUTES.integrations, icon: Plug },
      { label: "Modelos", to: ROUTES.models, icon: ScrollText },
      { label: "Documentos", to: ROUTES.documents, icon: FileText },
      { label: "Auditoria", to: ROUTES.audit, icon: ShieldCheck, adminOnly: true },
    ],
  },
];
