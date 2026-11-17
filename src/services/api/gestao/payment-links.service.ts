import { http } from "@/services/http/client";
import type { PaymentLink, RentalPaymentLinks } from "@/types/payment-link";

/** "Cobrar o saldo devedor": the public payment links of a rental. */
export const paymentLinksService = {
  async listByRental(rentalId: string) {
    const { data } = await http.get<RentalPaymentLinks>(
      `/rentals/${rentalId}/payment-links`,
    );
    return data;
  },
  /** Creates the PIX charge and groups the open rent charges (removed in Asaas). */
  async create(rentalId: string, input: { amount: number | null; acceptsCard: boolean; cardInstallments: boolean }, key: string) {
    const { data } = await http.post<PaymentLink>(
      `/rentals/${rentalId}/payment-links`,
      input,
      { headers: { "Idempotency-Key": key }, timeout: 120_000 },
    );
    return data;
  },
  async renew(id: string) {
    const { data } = await http.post<PaymentLink>(`/payment-links/${id}/renew`);
    return data;
  },
  async cancel(id: string) {
    const { data } = await http.post<PaymentLink>(`/payment-links/${id}/cancel`);
    return data;
  },
};
