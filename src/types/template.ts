import type { Caution } from "@/types/rental";

export type ContractTemplate = {
  id: string;
  name: string;
  slug: string;
  version: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContractTemplateDetail = ContractTemplate & {
  /** Raw template: {{vars}} and the {{{caucaoClause}}} slot. */
  bodyHtml: string;
  /** Caution clause per CautionType. */
  caucaoClauses: Partial<Record<Caution["type"], string>>;
};

export type ContractTemplateInput = {
  name: string;
  bodyHtml: string;
  caucaoClauses: Record<Caution["type"], string>;
  active: boolean;
};

/** One `{{variable}}` the editor can insert (catalog from the API). */
export type TemplateVariable = {
  /** Full Handlebars path, e.g. "customer.name". */
  key: string;
  label: string;
  description?: string;
  example?: string;
  kind: string;
};

export type TemplateVariableGroup = {
  key: string;
  label: string;
  /** Curated (the good path). */
  variables: TemplateVariable[];
  /** Straight from the schema: every column with no curated counterpart. */
  rawVariables: TemplateVariable[];
};

/** A whole-HTML block (`{{{caucaoClause}}}`), only in the body, once. */
export type TemplateSlot = { key: string; label: string; description?: string };

export type TemplateVariableCatalog = {
  groups: TemplateVariableGroup[];
  slots: TemplateSlot[];
};

export type InspectionRequirement = {
  id: string;
  key: string;
  label: string;
  required: boolean;
  position: number;
};

export type InspectionRequirements = {
  policy: {
    fullEveryDays: number | null;
    kmEveryDays: number | null;
    kmEveryKm: number | null;
    kmOnMaintenance: boolean;
  };
  types: {
    type: { id: string; name: string; slug: string };
    photos: InspectionRequirement[];
    /** Extra readings (mileage is built in and never listed). */
    readings: InspectionRequirement[];
    checks: InspectionRequirement[];
  }[];
};
