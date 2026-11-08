import { rethrowBlobError } from "@/helpers/api-error";
import { http } from "@/services/http/client";
import type {
  Contract,
  ContractDraft,
  ContractOptions,
} from "@/types/contract";

/**
 * Rental contracts ("Gerar contrato"). Draft, personalize and preview save
 * nothing; only POST /rentals/:id/contracts freezes the text and attaches
 * the PDF to the rental under "Contrato".
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
  /** 422 `fields.cnh` without a valid CNH; 409 on a retroactive rental. */
  async draft(rentalId: string, templateId: string) {
    const { data } = await http.get<ContractDraft>(
      `/rentals/${rentalId}/contracts/draft`,
      { params: { templateId } },
    );
    return data;
  },
  /** AI rewrites the text following the instructions. Nothing saved. */
  async personalize(html: string, instructions: string) {
    const { data } = await http.post<{ html: string }>(
      "/contracts/personalize",
      { html, instructions },
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
