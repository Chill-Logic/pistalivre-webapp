import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  ProviderEnvelope,
  ProviderEnvelopeDocument,
  SignatureDetail,
  SignatureFilters,
  SignatureListItem,
  SignatureSettingsInput,
  SignerInput,
} from "@/types/signature";

/**
 * Signature requests. Only `send` talks to the provider (creates the
 * envelope and notifies the signers by e-mail/WhatsApp): everything else is
 * configured here first. Writes answer the detail (except the 204s).
 */
export const signaturesService = {
  async list({
    page,
    pageSize,
    q,
    status,
    ownerType,
    ownerId,
  }: SignatureFilters) {
    const { data } = await http.get<Paginated<SignatureListItem>>(
      "/signatures",
      {
        params: toQueryParams({
          page,
          pageSize,
          q,
          status,
          ownerType,
          ownerId,
        }),
      },
    );
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<SignatureDetail>(`/signatures/${id}`);
    return data;
  },
  /** A draft over a PDF already attached somewhere. */
  async create(documentId: string, name: string) {
    const { data } = await http.post<SignatureDetail>("/signatures", {
      documentId,
      name,
    });
    return data;
  },
  async updateSettings(id: string, input: SignatureSettingsInput) {
    const { data } = await http.put<SignatureDetail>(
      `/signatures/${id}`,
      input,
    );
    return data;
  },
  async setSigners(id: string, signers: SignerInput[]) {
    const { data } = await http.put<SignatureDetail>(
      `/signatures/${id}/signers`,
      {
        signers,
      },
    );
    return data;
  },
  async send(id: string, key: string) {
    const { data } = await http.post<SignatureDetail>(
      `/signatures/${id}/send`,
      undefined,
      {
        headers: { "Idempotency-Key": key },
      },
    );
    return data;
  },
  async cancel(id: string) {
    const { data } = await http.post<SignatureDetail>(
      `/signatures/${id}/cancel`,
    );
    return data;
  },
  /** Signed outside (paper, WhatsApp): same effect as the provider's webhook. */
  async confirmSigned(id: string) {
    const { data } = await http.post<SignatureDetail>(
      `/signatures/${id}/confirm-signed`,
    );
    return data;
  },
  /** Removes it HERE; the envelope stays at the provider. */
  async unlink(id: string) {
    await http.post(`/signatures/${id}/unlink`);
  },
  async remove(id: string) {
    await http.delete(`/signatures/${id}`);
  },
  async notifySigner(id: string, signerId: string) {
    await http.post(`/signatures/${id}/signers/${signerId}/notify`);
  },
  async envelopes(params: { status?: string; page: number; pageSize: number }) {
    const { data } = await http.get<{
      items: ProviderEnvelope[];
      hasMore: boolean;
    }>("/signatures/envelopes", { params: toQueryParams(params) });
    return data;
  },
  async envelopeDocuments(externalId: string) {
    const { data } = await http.get<{ items: ProviderEnvelopeDocument[] }>(
      `/signatures/envelopes/${externalId}/documents`,
    );
    return data.items;
  },
  async importEnvelope(
    externalId: string,
    documents: { externalDocumentId: string; documentId: string }[],
  ) {
    const { data } = await http.post<{ created: SignatureDetail[] }>(
      "/signatures/import",
      { externalId, documents },
    );
    return data.created;
  },
};
