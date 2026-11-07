import { http } from "@/services/http/client";
import { toQueryParams } from "@/helpers/query-params";
import type { DebtDetail, DebtFilters, Debts } from "@/types/debt";

/** Company debts, read-only (registering payments is a money write). */
export const debtsService = {
  async list(filters: DebtFilters) {
    const { data } = await http.get<Debts>("/debts", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<DebtDetail>(`/debts/${id}`);
    return data;
  },
};
