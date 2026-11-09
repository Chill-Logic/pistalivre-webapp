import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  ConvertProposalInput,
  ProposalDetail,
  ProposalDraftInput,
  ProposalFilters,
  ProposalListItem,
  ProposalTemplateOption,
} from "@/types/proposal";

/**
 * Rental proposals. Draft, personalize and preview save nothing; only
 * POST /proposals issues (snapshot + PDF + status SENT).
 */
export const proposalsService = {
  async list({ page, pageSize, q, status }: ProposalFilters) {
    const { data } = await http.get<Paginated<ProposalListItem>>("/proposals", {
      params: toQueryParams({ page, pageSize, q, status }),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<ProposalDetail>(`/proposals/${id}`);
    return data;
  },
  async templates() {
    const { data } = await http.get<{ items: ProposalTemplateOption[] }>(
      "/proposal-templates",
    );
    return data.items;
  },
  /** The template merged with the terms, for the editor. Nothing saved. */
  async draft(input: ProposalDraftInput) {
    const { data } = await http.post<{ html: string }>(
      "/proposals/draft",
      input,
    );
    return data.html;
  },
  /**
   * AI rewrites the text following the instructions. Nothing saved; the
   * call's cost is recorded against the lead, when there is one.
   */
  async personalize(html: string, instructions: string, leadId?: string) {
    const { data } = await http.post<{ html: string }>(
      "/proposals/personalize",
      {
        html,
        instructions,
        ...(leadId ? { leadId } : {}),
      },
    );
    return data.html;
  },
  /** The PDF as it would come out (blob, with the Bearer). Nothing saved. */
  async preview(html: string) {
    const { data } = await http.post<Blob>(
      "/proposals/preview",
      { html },
      { responseType: "blob" },
    );
    return data;
  },
  async issue(input: ProposalDraftInput & { html: string }, key: string) {
    const { data } = await http.post<ProposalDetail>("/proposals", input, {
      headers: { "Idempotency-Key": key },
    });
    return data;
  },
  async accept(id: string) {
    const { data } = await http.post<ProposalDetail>(`/proposals/${id}/accept`);
    return data;
  },
  async reject(id: string, reason: string) {
    const { data } = await http.post<ProposalDetail>(
      `/proposals/${id}/reject`,
      {
        reason,
      },
    );
    return data;
  },
  async remove(id: string) {
    await http.delete(`/proposals/${id}`);
  },
  async convertToLead(id: string, input: ConvertProposalInput) {
    const { data } = await http.post<{ leadId: string }>(
      `/proposals/${id}/convert-to-lead`,
      input,
    );
    return data.leadId;
  },
};
