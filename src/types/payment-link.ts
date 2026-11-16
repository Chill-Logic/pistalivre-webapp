/** What a payment link grouped (snapshot of the charge before removing it). */
export type GroupedCharge = {
  paymentId: string;
  externalId: string | null;
  /** yyyy-mm-dd */
  dueDate: string | null;
  amount: number;
  label: string | null;
  status: string;
};

export type PaymentLinkState = "OPEN" | "EXPIRED" | "PAID" | "CANCELED";

/** The public payment link of a rental's outstanding balance (staff view). */
export type PaymentLink = {
  id: string;
  /** Public address (no login): whoever has it, pays. */
  url: string;
  state: PaymentLinkState;
  amount: number;
  description: string;
  referenceDate: string;
  expiresAt: string;
  paidMethod: "PIX" | "CREDIT_CARD" | null;
  paidAt: string | null;
  installments: number | null;
  /** Card: the total charged (with the installment interest). */
  grossAmount: number | null;
  cardLast4: string | null;
  cardBrand: string | null;
  groupedCharges: GroupedCharge[];
  renewCount: number;
  canceledAt: string | null;
  createdAt: string;
};

/** GET /rentals/:id/payment-links: the preview of a new link + the history. */
export type RentalPaymentLinks = {
  balance: number;
  /** Open rent charges a new link would group. */
  charges: GroupedCharge[];
  openLink: PaymentLink | null;
  items: PaymentLink[];
};

export type CardInstallmentOption = {
  installments: number;
  total: number;
  perInstallment: number;
  interest: number;
};

/** GET /public/pay/:token: the checkout as the payer sees it (minimal data). */
export type PublicPayment = {
  state: Exclude<PaymentLinkState, "CANCELED">;
  firstName: string;
  description: string;
  amount: number;
  expiresAt: string;
  pix: { payload: string; encodedImage: string } | null;
  cardOptions: CardInstallmentOption[];
  cardBlocked: boolean;
  paidMethod: "PIX" | "CREDIT_CARD" | null;
  paidAt: string | null;
  company: { name: string | null; whatsapp: string | null };
};

export type CardPaymentInput = {
  installments: number;
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
};
