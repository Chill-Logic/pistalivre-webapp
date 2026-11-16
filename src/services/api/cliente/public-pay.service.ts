import { http } from "@/services/http/client";
import type { CardPaymentInput, PublicPayment } from "@/types/payment-link";

const base = (token: string) => `/public/pay/${encodeURIComponent(token)}`;

/** The public checkout of an outstanding balance (no login: /pagar/:token). */
export const publicPayService = {
  async get(token: string) {
    const { data } = await http.get<PublicPayment>(base(token));
    return data;
  },
  /** Charged right away: comes back paid, or a 422 with the refusal. */
  async payWithCard(token: string, input: CardPaymentInput) {
    const { data } = await http.post<PublicPayment>(`${base(token)}/card`, input, {
      timeout: 120_000,
    });
    return data;
  },
};
