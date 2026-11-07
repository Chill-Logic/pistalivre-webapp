import { http } from "@/services/http/client";
import type { Statement, StatementFilters } from "@/types/statement";

export const statementService = {
  async load(filters: StatementFilters) {
    const { data } = await http.get<Statement>("/finance/statement", {
      params: filters,
    });
    return data;
  },
};
