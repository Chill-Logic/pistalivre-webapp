import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

export const vehiclesService = {
  async list(filters: VehicleFilters) {
    const { data } = await http.get<Paginated<Vehicle>>("/vehicles", {
      params: toQueryParams(filters),
    });
    return data;
  },
};
