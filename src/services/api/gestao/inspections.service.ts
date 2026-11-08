import { appendInspectionFields } from "@/helpers/inspection";
import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  InspectionCreateInput,
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
  /** One multipart request: the fields, the photos and the checks. */
  async create(input: InspectionCreateInput) {
    const body = new FormData();
    body.append("vehicleId", input.vehicleId);
    if (input.rentalId) body.append("rentalId", input.rentalId);
    body.append("performedBy", input.performedBy);
    appendInspectionFields(body, input);
    const { data } = await http.post<{ id: string }>("/inspections", body);
    return data;
  },
  /** The photos go with it. */
  async remove(id: string) {
    await http.delete(`/inspections/${id}`);
  },
};
