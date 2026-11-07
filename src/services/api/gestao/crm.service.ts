import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  LeadDetail,
  LeadFilters,
  LeadFunnel,
  LeadListItem,
} from "@/types/crm";

/** CRM, read-only (moving stages, logging activities and reopening are writes). */
export const crmService = {
  async funnel() {
    const { data } = await http.get<LeadFunnel>("/crm/funnel");
    return data;
  },
  async leads(filters: LeadFilters) {
    const { data } = await http.get<Paginated<LeadListItem>>("/crm/leads", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async lead(id: string) {
    const { data } = await http.get<LeadDetail>(`/crm/leads/${id}`);
    return data;
  },
};
