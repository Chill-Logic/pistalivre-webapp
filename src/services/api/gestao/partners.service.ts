import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Partner,
  PartnerContract,
  PartnerContractDetail,
  PartnerContractInput,
  PartnerDetail,
  PartnerFilters,
  PartnerInput,
  PartnerListRow,
  PartnerVehicleInput,
  PartnerVehicleUpdate,
} from "@/types/partner";

/** Partners and their contracts (admin only: agents get 403). */
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
  /** Only on a DRAFT; on an active contract the moto leaves with `leftAt`. */
  async removeVehicle(contractId: string, linkId: string) {
    const { data } = await http.delete<PartnerContract>(
      `/partner-contracts/${contractId}/vehicles/${linkId}`,
    );
    return data;
  },
};
