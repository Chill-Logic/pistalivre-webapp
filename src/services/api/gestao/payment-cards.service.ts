import { http } from "@/services/http/client";
import type { PaymentCard, PaymentCardInput } from "@/types/payment-card";

/** Cards the company pays bills with. Only the last 4 digits travel. */
export const paymentCardsService = {
  async list() {
    const { data } = await http.get<PaymentCard[]>("/payment-cards");
    return data;
  },
  async create(input: PaymentCardInput) {
    const { data } = await http.post<PaymentCard>("/payment-cards", input);
    return data;
  },
  async update(id: string, input: PaymentCardInput) {
    const { data } = await http.put<PaymentCard>(`/payment-cards/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/payment-cards/${id}`);
  },
};
