import { http } from "@/services/http/client";
import type { SearchParams, SearchResponse } from "@/types/search";

export const searchService = {
  /** Universal search (Ctrl+K); `signal` drops the previous keystroke's request. */
  async search(params: SearchParams, signal?: AbortSignal) {
    const { data } = await http.get<SearchResponse>("/search", {
      params: {
        q: params.q,
        types: params.types?.length ? params.types.join(",") : undefined,
        perGroup: params.perGroup,
      },
      signal,
    });
    return data;
  },
};
