import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  MaintenanceAnalysis,
  MaintenanceAnalysisFilters,
} from "@/types/maintenance-analysis";
import type {
  MaintenanceDetail,
  MaintenanceFilters,
  MaintenanceInput,
  MaintenanceListItem,
} from "@/types/maintenance";

export const maintenancesService = {
  /** Taxa de manutenção: the cost cut by `dimension`; `key` = one row's maintenances. */
  async analysis(filters: MaintenanceAnalysisFilters, key?: string) {
    const { data } = await http.get<MaintenanceAnalysis>("/maintenances/analysis", {
      params: {
        groupBy: filters.dimension,
        from: filters.from,
        to: filters.to,
        ...(key ? { key } : {}),
      },
    });
    return data;
  },
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
