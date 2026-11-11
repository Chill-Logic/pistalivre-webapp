import { rethrowBlobError } from "@/helpers/api-error";
import { http } from "@/services/http/client";
import type {
  Contract,
  ContractDraft,
  ContractDraftState,
  ContractOptions,
} from "@/types/contract";

/**
 * Rental contracts ("Gerar contrato"). The draft is saved on the server
 * while it's reviewed (editor, chat and MCP share it); personalize and
 * preview save nothing; POST /rentals/:id/contracts freezes the text,
 * attaches the PDF to the rental under "Contrato" and drops the draft.
 */
export const contractsService = {
  /** Whether the AI rewrite exists (contracts AND proposals). */
  async options() {
    const { data } = await http.get<ContractOptions>("/contracts/options");
    return data;
  },
  async list(rentalId: string) {
    const { data } = await http.get<{ items: Contract[] }>(
      `/rentals/${rentalId}/contracts`,
    );
    return data.items;
  },
  /** The saved draft as it is now (another tab, the chat or MCP may have changed it). */
  async getDraft(id: string) {
    const { data } = await http.get<ContractDraftState>(
      `/contract-drafts/${id}`,
    );
    return data;
  },
  /** Autosave: 409 when it changed elsewhere since `version`. */
  async saveDraft(id: string, html: string, version: number) {
    const { data } = await http.put<ContractDraftState>(
      `/contract-drafts/${id}`,
      { html, version },
    );
    return data;
  },
  /** Back to the text before the last change (whoever made it). */
  async undoDraft(id: string, version: number) {
    const { data } = await http.post<ContractDraftState>(
      `/contract-drafts/${id}/undo`,
      { version },
    );
    return data;
  },
  /** Merged again from the template (the old text stays undoable). */
  async resetDraft(id: string, version: number) {
    const { data } = await http.post<ContractDraftState>(
      `/contract-drafts/${id}/reset`,
      { version },
    );
    return data;
  },
  /**
   * The rental's draft for this template, saved on the server (the one in
   * progress, or a new one from the template). 422 `fields.cnh` without a
   * valid CNH; 409 on a retroactive rental.
   */
  async draft(rentalId: string, templateId: string) {
    const { data } = await http.get<ContractDraft>(
      `/rentals/${rentalId}/contracts/draft`,
      { params: { templateId } },
    );
    return data;
  },
  /**
   * AI rewrites the text following the instructions. Nothing saved; the
   * call's cost is recorded against the rental.
   */
  async personalize(html: string, instructions: string, rentalId: string) {
    const { data } = await http.post<{ html: string }>(
      "/contracts/personalize",
      { html, instructions, rentalId },
    );
    return data.html;
  },
  /** The PDF as it would come out, with the signature block. Nothing saved. */
  async preview(input: { rentalId: string; templateId: string; html: string }) {
    const { data } = await http
      .post<Blob>("/contracts/preview", input, {
        responseType: "blob",
        timeout: 120_000,
      })
      .catch(rethrowBlobError);
    return data;
  },
  async create(
    rentalId: string,
    input: { templateId: string; html: string },
    key: string,
  ) {
    const { data } = await http.post<Contract>(
      `/rentals/${rentalId}/contracts`,
      input,
      { headers: { "Idempotency-Key": key }, timeout: 120_000 },
    );
    return data;
  },
  /** The PDF goes with it; 409 when the PDF is in a signature request. */
  async remove(id: string) {
    await http.delete(`/contracts/${id}`);
  },
};
