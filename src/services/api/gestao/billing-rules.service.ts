import { http } from "@/services/http/client";
import type { BillingRules } from "@/types/billing-rules";

/** Configurações › Regras de cobrança: the late fee and interest every new charge uses. */
export const billingRulesService = {
  async get() {
    const { data } = await http.get<BillingRules>("/settings/billing-rules");
    return data;
  },
};
