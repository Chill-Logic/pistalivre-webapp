import { rethrowBlobError } from "@/helpers/api-error";
import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Partner,
  PartnerContract,
  PartnerContractDetail,
  PartnerContractDocument,
  PartnerContractDocumentDraft,
  PartnerContractInput,
  PartnerDetail,
  PartnerFilters,
  PartnerInput,
  PartnerListRow,
  PartnerVehicleInput,
  PartnerVehicleUpdate,
} from "@/types/partner";

/** Partners and their contracts (the whole staff: admins and agents). */
export const partnersService = {
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
  /**
   * Freezes the text as the contract's PDF (the server adds the signatures).
   * Generating again points to the new file; the old one stays. Needs a vehicle.
   */
  async generateDocument(id: string, html: string) {
    const { data } = await http.post<PartnerContractDocument>(
      `/partner-contracts/${id}/document`,
      { html },
      { timeout: 120_000 },
    );
    return data;
  },
};
