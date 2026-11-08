import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  AsaasDirectory,
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
  /** Read-through of the Asaas customers, matched by CPF. */
  async asaasDirectory() {
    const { data } = await http.get<AsaasDirectory>(
      "/customers/asaas-directory",
    );
    return data;
  },
  /** Links to the same person (same CPF) in Asaas; another CPF → 422. */
  async linkAsaas(id: string, asaasCustomerId: string) {
    const { data } = await http.post<CustomerDetail>(
      `/customers/${id}/asaas-link`,
      { asaasCustomerId },
    );
    return data;
  },
  /** Creates a linked stub from an "only in Asaas" customer (CPF here → 409). */
  async importFromAsaas(asaasCustomerId: string) {
    const { data } = await http.post<CustomerDetail>(
      "/customers/import-from-asaas",
      { asaasCustomerId },
    );
    return data;
  },
};
