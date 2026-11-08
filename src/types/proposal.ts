import type { DocumentFile } from "@/types/document";

export type ProposalStatus = "SENT" | "ACCEPTED" | "REJECTED";

export type ProposalListItem = {
  id: string;
  status: ProposalStatus;
  rejectionReason: string | null;
  recipient: { name: string; phone: string | null; email: string | null };
  /** null = standalone ("avulsa"): issued to someone outside the funnel. */
  lead: { id: string; name: string; status: string } | null;
  vehicle: { id: string; plate: string; label: string } | null;
  document: DocumentFile | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalDetail = ProposalListItem & {
  template: { id: string; name: string; version: number } | null;
  /** The optional clauses that went into this proposal. */
  clauses: { key: string; label: string }[];
  /** Frozen snapshot, RAW from the API: always render through previewHtml. */
  renderedHtml: string;
};

export type ProposalFilters = {
  page: number;
  pageSize: number;
  q: string;
  status: ProposalStatus | "";
};

/** An active proposal template and its optional clauses. */
export type ProposalTemplateOption = {
  id: string;
  name: string;
  version: number;
  clauses: { key: string; label: string }[];
};

/** The terms filled in the composer (all optional; the template decides). */
export type ProposalInputs = {
  vehicleId?: string;
  rate?: number;
  ratePeriod?: string;
  cautionTotal?: number;
  startDate?: string;
  notes?: string;
};

/**
 * Target + terms of POST /proposals/draft and POST /proposals: from a CRM
 * lead, or standalone with the recipient typed in (it freezes on it).
 */
export type ProposalDraftInput = {
  leadId?: string;
  recipient?: { name: string; phone?: string; email?: string };
  templateId: string;
  inputs: ProposalInputs;
  clauses: string[];
};

export type ConvertProposalInput = {
  name: string;
  phone: string;
  email?: string;
};
