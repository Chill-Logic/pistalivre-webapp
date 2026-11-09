import { ROUTES } from "@/constants/routes";
import type { SectionTab } from "@/components/molecules/section-tabs";

/** Sections of the finance area (tabs under the page title). */
export const FINANCE_TABS: SectionTab[] = [
  { label: "Visão geral", to: ROUTES.finance, end: true },
  { label: "Contas do mês", to: ROUTES.financeBills },
  { label: "Débitos", to: ROUTES.financeDebts },
  { label: "Extrato", to: ROUTES.financeStatement },
];
