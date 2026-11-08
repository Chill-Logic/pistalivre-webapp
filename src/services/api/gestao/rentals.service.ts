import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Charge,
  RentalDetail,
  RentalFilters,
  RentalInput,
  RentalRecord,
  RentalStatus,
  RentalListItem,
} from "@/types/rental";

export const rentalsService = {
  async list(filters: RentalFilters) {
    const { data } = await http.get<Paginated<RentalListItem>>("/rentals", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<RentalDetail>(`/rentals/${id}`);
    return data;
  },
  async create(input: RentalInput) {
    const { data } = await http.post<RentalRecord>("/rentals", input);
    return data;
  },
  async update(id: string, input: RentalInput) {
    const { data } = await http.put<RentalRecord>(`/rentals/${id}`, input);
    return data;
  },
  async changeStatus(id: string, status: RentalStatus) {
    const { data } = await http.patch<RentalRecord>(`/rentals/${id}/status`, {
      status,
    });
    return data;
  },
  async remove(id: string) {
    await http.delete(`/rentals/${id}`);
  },
  async charges(id: string) {
    const { data } = await http.get<{ items: Charge[] }>(
      `/rentals/${id}/charges`,
    );
    return data.items;
  },
};
