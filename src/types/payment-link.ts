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
  expiresAt: string | null;
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

/** A part of the balance no charge was ever issued for (e.g. the last bit of a monthly). */
export type UnchargedPeriod = {
  /** yyyy-mm-dd, first and last billed day. */
  from: string;
  to: string;
  amount: number;
};

/** GET /rentals/:id/payment-links: the preview of a new link + the history. */
export type RentalPaymentLinks = {
  balance: number;
  /** Open rent charges a new link would group. */
  charges: GroupedCharge[];
  /** In the balance without a charge (shown so the list adds up). */
  uncharged: UnchargedPeriod[];
  /** balance − everything listed: negative = already paid in part; positive = open outside the list. */
  adjustment: number;
  /** Fine/interest already accrued on the overdue charges it groups (goes in the link). */
  surcharge: number;
  /** The link's amount: balance + surcharge (server). */
  total: number;
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
  /** null = does not expire (the link of one charge). */
  expiresAt: string | null;
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
