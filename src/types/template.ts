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
  /** Only on `kind: "list"`: the fields of one item (`{{this.x}}` in `#each`). */
  itemFields?: Omit<TemplateVariable, "itemFields">[];
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

/** Kind of an inspection item (photo, extra reading or checked item). */
export type InspectionItemKind = "PHOTO" | "READING" | "CHECK";

/** POST /inspection-requirements — goes to the END of the type's list. */
export type InspectionRequirementInput = {
  vehicleTypeId: string;
  label: string;
  kind: InspectionItemKind;
  required: boolean;
};

export type InspectionPolicy = InspectionRequirements["policy"];

/** PUT /inspection-policy — every number is required (1 or more). */
export type InspectionPolicyInput = {
  fullEveryDays: number;
  kmEveryDays: number;
  kmEveryKm: number;
  kmOnMaintenance: boolean;
};

/** A proposal template in the models list (`?active=all`). */
export type ProposalTemplateSummary = {
  id: string;
  name: string;
  version: number;
  active: boolean;
  clauses: { key: string; label: string }[];
};

export type ProposalTemplateDetail = {
  id: string;
  name: string;
  slug: string;
  version: number;
  active: boolean;
  /** Raw template: {{vars}} and the {{{clauses}}} slot. */
  bodyHtml: string;
  /** Optional clauses (checkboxes when issuing); the key comes from the label. */
  clauses: { key: string; label: string; html: string }[];
  createdAt: string;
  updatedAt: string;
};

export type ProposalTemplateInput = {
  name: string;
  bodyHtml: string;
  /** Blank rows are dropped by the API. */
  clauses: { label: string; html: string }[];
  active: boolean;
};
