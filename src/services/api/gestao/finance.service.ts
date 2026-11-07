import { http } from "@/services/http/client";
import type { Balances, Delinquency } from "@/types/dashboard";
import type { ToCollect } from "@/types/finance";

/** Finance, read-only: issuing/settling charges stays with the owner's call. */
export const financeService = {
  async balances() {
    const { data } = await http.get<Balances>("/finance/balances");
    return data;
  },
  async delinquency() {
    const { data } = await http.get<Delinquency>("/finance/delinquency");
    return data;
  },
  async toCollect() {
    const { data } = await http.get<ToCollect>("/finance/to-collect");
    return data;
  },
};
