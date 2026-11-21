import { http } from "@/services/http/client";
import type { FineDiscountResult, FineReviewItem } from "@/types/fine-review";

/** Late fees above the rule: adjust the open ones, give back the excess of the paid ones. */
export const fineReviewService = {
  async list() {
    const { data } = await http.get<{ items: FineReviewItem[] }>("/finance/fine-review");
    return data.items;
  },
  async adjust(paymentId: string) {
    await http.post(`/finance/fine-review/${paymentId}/adjust`);
  },
  async discount(paymentId: string) {
    const { data } = await http.post<FineDiscountResult>(`/finance/fine-review/${paymentId}/discount`);
    return data;
  },
};
