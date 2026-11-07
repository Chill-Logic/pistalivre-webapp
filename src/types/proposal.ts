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
