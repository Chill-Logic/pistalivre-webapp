import type { SectionTab } from "@/components/molecules/section-tabs";
import { ROUTES } from "@/constants/routes";
import type { InspectionItemKind } from "@/types/template";

/** Tabs of the templates area. */
export const MODEL_TABS: SectionTab[] = [
  { label: "Contratos", to: ROUTES.models, end: true },
  { label: "Propostas", to: ROUTES.modelsProposals },
  { label: "Vistoria", to: ROUTES.modelsInspection },
];

/** Kinds of an inspection item, in the order the forms offer them. */
export const INSPECTION_ITEM_KINDS: { value: InspectionItemKind; label: string }[] =
  [
    { value: "PHOTO", label: "Foto" },
    { value: "READING", label: "Leitura" },
    { value: "CHECK", label: "Verificação" },
  ];
