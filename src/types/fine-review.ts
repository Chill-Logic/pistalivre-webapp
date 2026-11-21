/** Financeiro › Multas acima da regra (GET /finance/fine-review). */
export type FineReview =
  | { kind: "open"; finePercent: number; ruleFinePercent: number; overdue: boolean }
  | {
      kind: "paid";
      finePercent: number;
      ruleFinePercent: number;
      charged: number;
      allowed: number;
      excess: number;
    };

export interface FineReviewItem {
  paymentId: string;
  rentalId: string | null;
  rentalCode: string | null;
  customerId: string | null;
  customerName: string | null;
  dueDate: string | null;
  paidAt: string | null;
  amount: number;
  review: FineReview;
  discount: { status: "PENDING" | "APPLIED" | "CANCELLED"; amount: number; appliedPaymentId: string | null } | null;
}

export interface FineDiscountResult {
  status: "PENDING" | "APPLIED";
  amount: number;
  appliedTo: string | null;
}
