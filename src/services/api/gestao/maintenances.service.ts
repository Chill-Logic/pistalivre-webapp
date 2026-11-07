import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  MaintenanceDetail,
  MaintenanceFilters,
  MaintenanceListItem,
} from "@/types/maintenance";

export const maintenancesService = {
  async list(filters: MaintenanceFilters) {
    const { data } = await http.get<Paginated<MaintenanceListItem>>(
      "/maintenances",
      { params: toQueryParams(filters) },
    );
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<MaintenanceDetail>(`/maintenances/${id}`);
    return data;
  },
};
