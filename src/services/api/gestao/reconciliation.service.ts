import { http } from "@/services/http/client";
import type { ReconciliationView } from "@/types/reconciliation";

export const reconciliationService = {
  /** Pix in the Inter matched to our charges — suggestions only (last 15 days). */
  async suggestions() {
    const { data } = await http.get<ReconciliationView>("/reconciliation/suggestions");
    return data;
  },
  /** "Não é este" (targetKey = the target's key) or "ignorar este pix" (targetKey = "line"). */
  async dismiss(bankKey: string, targetKey: string) {
    await http.post("/reconciliation/dismissals", { bankKey, targetKey });
  },
};
