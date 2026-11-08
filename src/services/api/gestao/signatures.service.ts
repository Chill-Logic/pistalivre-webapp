import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  SignatureDetail,
  SignatureFilters,
  SignatureListItem,
} from "@/types/signature";

export const signaturesService = {
  async list({ page, pageSize, q, status }: SignatureFilters) {
    const { data } = await http.get<Paginated<SignatureListItem>>("/signatures", {
      params: toQueryParams({ page, pageSize, q, status }),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<SignatureDetail>(`/signatures/${id}`);
    return data;
  },
};
