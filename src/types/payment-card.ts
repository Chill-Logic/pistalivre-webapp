/** The company's card, or one of a team member. */
export type PaymentCardHolder = "COMPANY" | "USER";

/** A card bills are paid with (GET /payment-cards). Never the number. */
export type PaymentCard = {
  id: string;
  name: string;
  lastDigits: string | null;
  /** "Nubank PJ •••• 1234". */
  label: string;
  holderType: PaymentCardHolder;
  holder: { id: string; name: string } | null;
  /** IOF + spread on a foreign-currency purchase (%). */
  foreignSurchargePercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** How a cost/expense names its card. */
export type PaymentCardRef = {
  id: string;
  label: string;
  holderType: PaymentCardHolder;
  holderName: string | null;
};

/** Body of POST/PUT /payment-cards. */
export type PaymentCardInput = {
  name: string;
  lastDigits: string | null;
  holderType: PaymentCardHolder;
  holderUserId: string | null;
  foreignSurchargePercent: number;
  active: boolean;
};
