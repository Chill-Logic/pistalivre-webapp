import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type {
  SupplierDetail,
  SupplierFilters,
  SupplierInput,
  SupplierListItem,
} from "@/types/supplier";

export const suppliersService = {
  async list(filters: SupplierFilters) {
    const { data } = await http.get<{ items: SupplierListItem[] }>(
      "/suppliers",
      { params: toQueryParams(filters) },
    );
    return data.items;
  },
  async get(id: string) {
    const { data } = await http.get<SupplierDetail>(`/suppliers/${id}`);
    return data;
  },
  async create(input: SupplierInput) {
    const { data } = await http.post<SupplierDetail>("/suppliers", input);
    return data;
  },
  async update(id: string, input: SupplierInput) {
    const { data } = await http.put<SupplierDetail>(`/suppliers/${id}`, input);
    return data;
  },
  /** Links and documents go with it. */
  async remove(id: string) {
    await http.delete(`/suppliers/${id}`);
  },
  /** Links the vehicle, or updates its amount when already linked. */
  async linkVehicle(id: string, vehicleId: string, monthlyAmount: number) {
    const { data } = await http.put<SupplierDetail>(
      `/suppliers/${id}/vehicles/${vehicleId}`,
      { monthlyAmount },
    );
    return data;
  },
  async unlinkVehicle(id: string, vehicleId: string) {
    const { data } = await http.delete<SupplierDetail>(
      `/suppliers/${id}/vehicles/${vehicleId}`,
    );
    return data;
  },
  /** Same amount on the given linked vehicles (all of them without ids). */
  async propagate(id: string, monthlyAmount: number, vehicleIds?: string[]) {
    const { data } = await http.post<SupplierDetail>(
      `/suppliers/${id}/propagate`,
      { monthlyAmount, ...(vehicleIds ? { vehicleIds } : {}) },
    );
    return data;
  },
};
