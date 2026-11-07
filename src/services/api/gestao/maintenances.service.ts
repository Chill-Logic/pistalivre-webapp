import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  MaintenanceDetail,
  MaintenanceFilters,
  MaintenanceInput,
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
  async create(input: MaintenanceInput) {
    const { data } = await http.post<MaintenanceDetail>("/maintenances", input);
    return data;
  },
  /** Replaces everything but the vehicle, rental and who registered it. */
  async update(id: string, input: MaintenanceInput) {
    const { data } = await http.put<MaintenanceDetail>(
      `/maintenances/${id}`,
      input,
    );
    return data;
  },
  async remove(id: string) {
    await http.delete(`/maintenances/${id}`);
  },
  /** Workshops already used (suggestions for the creatable combobox). */
  async providers() {
    const { data } = await http.get<{ items: string[] }>(
      "/maintenances/providers",
    );
    return data.items;
  },
};
