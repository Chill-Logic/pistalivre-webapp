/** Kinds of record the universal search finds (same codes as the API). */
export type SearchEntityType =
  | "rental"
  | "payment"
  | "customer"
  | "vehicle"
  | "maintenance"
  | "customerDebt"
  | "receipt"
  | "lead"
  | "proposal"
  | "document"
  | "inspection"
  | "debt"
  | "expense"
  | "supplier"
  | "partner";

export type SearchDetail = { label: string; value: string };

export type SearchResultItem = {
  type: SearchEntityType;
  id: string;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  /** Where Enter goes (a charge opens its rental). */
  target: { type: string; id: string | null };
  details: SearchDetail[];
  occurredAt: string | null;
};

export type SearchGroup = {
  /** "shortcut" = the recognized pattern (plate, CPF, value…). */
  key: SearchEntityType | "shortcut";
  label: string;
  items: SearchResultItem[];
  total: number;
};

export type SearchGuideSection = { id: string; title: string; text: string };

export type SearchResponse = {
  query: string;
  patterns: string[];
  groups: SearchGroup[];
  guide: SearchGuideSection[];
};

export type SearchParams = {
  q: string;
  types?: SearchEntityType[];
  perGroup?: number;
};
