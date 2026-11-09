import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type { AiUsageEntry, AiUsageFilters, AiUsageSummary } from "@/types/ai-usage";

/** What the AI costs (admin only — the API answers 403 to agents). */
export const aiUsageService = {
  async summary(month: string) {
    const { data } = await http.get<AiUsageSummary>("/ai-usage/summary", {
      params: { month },
    });
    return data;
  },
  async list(filters: AiUsageFilters) {
    const { data } = await http.get<Paginated<AiUsageEntry>>("/ai-usage", {
      params: toQueryParams(filters),
    });
    return data;
  },
};
