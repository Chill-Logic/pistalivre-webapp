import {
  CarFront,
  FileText,
  LayoutDashboard,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

/** Main navigation, shared by the mobile bottom bar and the desktop sidebar. */
export const MAIN_NAV: NavItem[] = [
  { label: "Painel", to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Veículos", to: ROUTES.vehicles, icon: CarFront },
  { label: "Locações", to: ROUTES.rentals, icon: FileText },
  { label: "Clientes", to: ROUTES.customers, icon: Users },
  { label: "Financeiro", to: ROUTES.finance, icon: Wallet },
];
