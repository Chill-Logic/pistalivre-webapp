import type { SectionTab } from "@/components/molecules/section-tabs";
import { ROUTES } from "@/constants/routes";

/** Tabs of the templates area. */
export const MODEL_TABS: SectionTab[] = [
  { label: "Contratos", to: ROUTES.models, end: true },
  { label: "Vistoria", to: ROUTES.modelsInspection },
];
