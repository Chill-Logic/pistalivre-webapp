import { pageOfItems } from "@/helpers/pagination";
import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  SignatureDetail,
  SignatureFilters,
  SignatureListItem,
} from "@/types/signature";

export const signaturesService = {
  /** The API returns the whole list; paged here. */
  async list({ page, pageSize, q, status }: SignatureFilters) {
    const { data } = await http.get<{ items: SignatureListItem[] }>(
      "/signatures",
      { params: toQueryParams({ q, status }) },
    );
    return pageOfItems(data.items, page, pageSize) as Paginated<SignatureListItem>;
  },
  async get(id: string) {
    const { data } = await http.get<SignatureDetail>(`/signatures/${id}`);
    return data;
  },
};
