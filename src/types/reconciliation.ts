/** A pix that fell in the Inter account (only incoming money is reconciled). */
export type BankCredit = {
  key: string;
  date: string;
  amount: number;
  payerName: string;
};

export type ReconTarget =
  | {
      kind: "receipt";
      key: string;
      rentalId: string;
      rentalCode: string;
      plate: string | null;
    }
  | {
      kind: "settle";
      key: string;
      paymentId: string;
      rentalId: string | null;
      rentalCode: string | null;
      chargeAmount: number;
      dueDate: string | null;
      label: string;
      channel: "asaas" | "manual";
      exact: boolean;
    };

export type ReconSuggestion = {
  credit: BankCredit;
  customer: { id: string; name: string };
  /** Best first: the card shows the first; "não é este" moves to the next. */
  targets: ReconTarget[];
  confidence: "high" | "medium";
};

export type ReconciliationView = {
  period: { start: string; end: string };
  suggestions: ReconSuggestion[];
  /** The bank was down (or not set up): nothing to suggest, said out loud. */
  error: string | null;
};
