import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  Charge,
  RentalDetail,
  RentalFilters,
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
  async charges(id: string) {
    const { data } = await http.get<{ items: Charge[] }>(
      `/rentals/${id}/charges`,
    );
    return data.items;
  },
};
