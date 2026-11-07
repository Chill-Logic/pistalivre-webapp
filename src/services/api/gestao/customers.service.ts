import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  CustomerDetail,
  CustomerFilters,
  CustomerListItem,
} from "@/types/customer";

export const customersService = {
  async list(filters: CustomerFilters) {
    const { data } = await http.get<Paginated<CustomerListItem>>("/customers", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<CustomerDetail>(`/customers/${id}`);
    return data;
  },
};
