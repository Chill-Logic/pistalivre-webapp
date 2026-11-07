import { http } from "@/services/http/client";
import type { DebtDetail, Debts } from "@/types/debt";

/** Company debts, read-only (registering payments is a money write). */
export const debtsService = {
  async list() {
    const { data } = await http.get<Debts>("/debts");
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<DebtDetail>(`/debts/${id}`);
    return data;
  },
};
