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
