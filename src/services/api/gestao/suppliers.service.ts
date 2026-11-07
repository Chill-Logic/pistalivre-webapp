import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type {
  SupplierDetail,
  SupplierFilters,
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
};
