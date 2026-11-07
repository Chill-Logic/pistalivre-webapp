import { pageOfItems } from "@/helpers/pagination";
import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  ProposalDetail,
  ProposalFilters,
  ProposalListItem,
} from "@/types/proposal";

export const proposalsService = {
  /** The API returns the whole list (the latest 200); paged here. */
  async list({ page, pageSize, q, status }: ProposalFilters) {
    const { data } = await http.get<{ items: ProposalListItem[] }>(
      "/proposals",
      { params: toQueryParams({ q, status }) },
    );
    return pageOfItems(data.items, page, pageSize) as Paginated<ProposalListItem>;
  },
  async get(id: string) {
    const { data } = await http.get<ProposalDetail>(`/proposals/${id}`);
    return data;
  },
};
