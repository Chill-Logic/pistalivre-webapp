import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  ProposalDetail,
  ProposalFilters,
  ProposalListItem,
} from "@/types/proposal";

export const proposalsService = {
  async list({ page, pageSize, q, status }: ProposalFilters) {
    const { data } = await http.get<Paginated<ProposalListItem>>("/proposals", {
      params: toQueryParams({ page, pageSize, q, status }),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<ProposalDetail>(`/proposals/${id}`);
    return data;
  },
};
