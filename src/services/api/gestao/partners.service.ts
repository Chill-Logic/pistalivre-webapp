import type {
  PartnerSimulation,
  PartnerSimulationInput,
} from "@/types/partner-simulation";
import { rethrowBlobError } from "@/helpers/api-error";
import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Partner,
  PartnerContract,
  PartnerContractDetail,
  PartnerContractDocument,
  PartnerCalculatorScenario,
  PartnerContractDocumentDraft,
  PartnerContractTextDraft,
  PartnerContractInput,
  PartnerDetail,
  PartnerFilters,
  PartnerInput,
  PartnerListRow,
  PartnerProposals,
  PartnerProposalVersion,
  PartnerVehicleInput,
  PartnerVehicleUpdate,
} from "@/types/partner";

/** Partners and their contracts (the whole staff: admins and agents). */
export const partnersService = {
  /** The contract calculator: a month of the terms, computed by the server. */
  async simulateContract(input: PartnerSimulationInput) {
    const { data } = await http.post<PartnerSimulation>(
      "/partner-contracts/simulate",
      input,
    );
    return data;
  },
  async list(filters: PartnerFilters) {
    const { data } = await http.get<Paginated<PartnerListRow>>("/partners", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<PartnerDetail>(`/partners/${id}`);
    return data;
  },
  async create(input: PartnerInput) {
    const { data } = await http.post<Partner>("/partners", input);
    return data;
  },
  async update(id: string, input: PartnerInput) {
    const { data } = await http.patch<Partner>(`/partners/${id}`, input);
    return data;
  },
  /** Only without contracts (422 otherwise). */
  async remove(id: string) {
    await http.delete(`/partners/${id}`);
  },
  /** Gives or resets the access (login = e-mail); open sessions end. */
  async setAccess(id: string, password: string) {
    await http.put(`/partners/${id}/access`, { password });
  },
  async revokeAccess(id: string) {
    await http.delete(`/partners/${id}/access`);
  },
  /** Born as a DRAFT. */
  async createContract(partnerId: string, input: PartnerContractInput) {
    const { data } = await http.post<PartnerContract>(
      `/partners/${partnerId}/contracts`,
      input,
    );
    return data;
  },
  async getContract(id: string) {
    const { data } = await http.get<PartnerContractDetail>(
      `/partner-contracts/${id}`,
    );
    return data;
  },
  async updateContract(id: string, input: PartnerContractInput) {
    const { data } = await http.patch<PartnerContract>(
      `/partner-contracts/${id}`,
      input,
    );
    return data;
  },
  /** Only a DRAFT. */
  async removeContract(id: string) {
    await http.delete(`/partner-contracts/${id}`);
  },
  async addVehicle(contractId: string, input: PartnerVehicleInput) {
    const { data } = await http.post<PartnerContract>(
      `/partner-contracts/${contractId}/vehicles`,
      input,
    );
    return data;
  },
  async updateVehicle(
    contractId: string,
    linkId: string,
    input: PartnerVehicleUpdate,
  ) {
    const { data } = await http.patch<PartnerContract>(
      `/partner-contracts/${contractId}/vehicles/${linkId}`,
      input,
    );
    return data;
  },
  /** Only on a DRAFT; on an active contract the vehicle leaves with `leftAt`. */
  async removeVehicle(contractId: string, linkId: string) {
    const { data } = await http.delete<PartnerContract>(
      `/partner-contracts/${contractId}/vehicles/${linkId}`,
    );
    return data;
  },
  /** The PDF attached to the contract (null until it is generated). */
  async getDocument(id: string) {
    const { data } = await http.get<PartnerContractDocument>(
      `/partner-contracts/${id}/document`,
    );
    return data;
  },
  /**
   * The contract's LIVING text (saved on the server, created from the base
   * text the first time): the editor, the chat and MCP edit the same text.
   */
  async textDraft(id: string) {
    const { data } = await http.get<PartnerContractTextDraft>(
      `/partner-contracts/${id}/text-draft`,
    );
    return data;
  },
  /**
   * The base text for terms NOT saved yet ("Novo contrato" › Contrato):
   * `html` null while the terms are incomplete (`missing` says what's left).
   */
  async contractTextPreview(partnerId: string, input: PartnerContractInput) {
    const { data } = await http.post<{ html: string | null; missing: string[] }>(
      `/partners/${partnerId}/contract-text-preview`,
      input,
    );
    return data;
  },
  /** Saves the calculator's scenario on the contract (a working note). */
  async saveCalculator(id: string, scenario: PartnerCalculatorScenario) {
    const { data } = await http.put<PartnerContract>(
      `/partner-contracts/${id}/calculator`,
      scenario,
    );
    return data;
  },
  /**
   * "Enviar para assinatura" without the partner's review (closed outside):
   * the text (the living draft's) and the terms freeze as a version accepted
   * by the company, and the signature request opens with the partner.
   */
  async sendToSignature(id: string) {
    const { data } = await http.post<{
      version: PartnerProposalVersion;
      signatureRequestId: string;
    }>(`/partner-contracts/${id}/send-to-signature`, {}, { timeout: 120_000 });
    return data;
  },
  /** Base text with the contract's data; nothing saved. */
  async documentDraft(id: string) {
    const { data } = await http.get<PartnerContractDocumentDraft>(
      `/partner-contracts/${id}/document/draft`,
    );
    return data;
  },
  /** The PDF of the edited text, nothing saved. */
  async previewDocument(id: string, html: string) {
    const { data } = await http
      .post<Blob>(
        `/partner-contracts/${id}/document/preview`,
        { html },
        { responseType: "blob", timeout: 120_000 },
      )
      .catch(rethrowBlobError);
    return data;
  },
  /** The versions sent to the partner, newest first. */
  async proposals(id: string) {
    const { data } = await http.get<PartnerProposals>(
      `/partner-contracts/${id}/proposals`,
    );
    return data;
  },
  /**
   * Sends the proposal: freezes the terms, the vehicles and the PDF of the
   * text as the next version (a pending one is withdrawn). Draft only.
   */
  async propose(id: string, html: string) {
    const { data } = await http.post<PartnerProposalVersion>(
      `/partner-contracts/${id}/proposals`,
      { html },
      { timeout: 120_000 },
    );
    return data;
  },
  async withdrawProposal(id: string, versionId: string) {
    await http.post(`/partner-contracts/${id}/proposals/${versionId}/withdraw`);
  },
  /** From the accepted version: a signature request (draft) with its PDF. */
  async requestProposalSignature(id: string, versionId: string) {
    const { data } = await http.post<{ signatureRequestId: string }>(
      `/partner-contracts/${id}/proposals/${versionId}/signature`,
    );
    return data;
  },
};
