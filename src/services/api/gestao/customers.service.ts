import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  CustomerDetail,
  CustomerFilters,
  CustomerListItem,
} from "@/types/customer";
import type { CustomerInput, CustomerSaveResult } from "@/types/customer-input";

export const customersService = {
  async list(filters: CustomerFilters) {
    const { data } = await http.get<Paginated<CustomerListItem>>("/customers", {
      params: toQueryParams(filters),
    });
    return data;
  },
  /** Also upserts the customer in Asaas (complete profile, needed for NF). */
  async create(input: CustomerInput) {
    const { data } = await http.post<CustomerSaveResult>("/customers", input);
    return data;
  },
  async update(id: string, input: CustomerInput) {
    const { data } = await http.put<CustomerSaveResult>(
      `/customers/${id}`,
      input,
    );
    return data;
  },
  async remove(id: string) {
    await http.delete(`/customers/${id}`);
  },
  async get(id: string) {
    const { data } = await http.get<CustomerDetail>(`/customers/${id}`);
    return data;
  },
};
