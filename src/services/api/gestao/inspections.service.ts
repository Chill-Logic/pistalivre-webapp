import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  InspectionDetail,
  InspectionFilters,
  InspectionListItem,
} from "@/types/inspection";

export const inspectionsService = {
  async list(filters: InspectionFilters) {
    const { data } = await http.get<Paginated<InspectionListItem>>(
      "/inspections",
      { params: toQueryParams(filters) },
    );
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<InspectionDetail>(`/inspections/${id}`);
    return data;
  },
};
