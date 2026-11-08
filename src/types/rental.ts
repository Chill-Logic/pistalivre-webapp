import type { DocumentAttachment, DocumentFile } from "@/types/document";

export type RentalStatus =
  | "DRAFT"
  | "RESERVED"
  | "CONTRACT_PENDING"
  | "SIGNED"
  | "AWAITING_CAUTION"
  | "AWAITING_DELIVERY"
  | "ACTIVE"
  | "RETURNED"
  | "CANCELLED"
  | "WITHDRAWN";

export type RatePeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type RentalListItem = {
  id: string;
  code: string;
  status: RentalStatus;
  /** Calendar dates at midnight UTC: format with formatCalendarDate. */
  startDate: string;
  endDate: string | null;
  rate: number;
  ratePeriod: RatePeriod;
  /** `document` (CPF) only comes on the detail. */
  customer: { id: string; name: string; document?: string | null };
  vehicle: {
    id: string;
    plate: string;
    year: number;
    brand: { name: string };
    model: { name: string };
  };
};

export type CautionInstallment = {
  label: string;
  amount: number;
  dueDate: string;
  description?: string;
};

export type Caution = {
  type: "FIXED" | "WEEKLY" | "INSTALLMENTS";
  total: number;
  installmentValue: number | null;
  weekday: number | null;
  installments: CautionInstallment[] | null;
};

/** What the writes (POST/PUT/PATCH) answer: the detail without documents. */
export type RentalRecord = RentalListItem & {
  /** MANUAL = registered retroactively. */
  source: "SYSTEM" | "MANUAL";
  notes: string | null;
  paymentMethod: string | null;
  /** 0 = Sunday … 6 = Saturday. */
  paymentWeekday: number | null;
  billingChannel: "asaas" | "manual";
  autoBillingEnabled: boolean;
  rentBillingTiming: "CYCLE_START" | "CYCLE_END";
  billingSkipWeekdays: number[];
  /**
   * The billing day as the server words it ("Segunda-feira", "Todo dia 5",
   * "Todos os dias, exceto domingo"). Only in GET /rentals/:id.
   */
  billingDayLabel?: string | null;
  /** Early end with reasons (only GET /rentals/:id and the termination). */
  termination?: RentalTermination | null;
  caution: Caution | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /rentals/:id (documents come only in the read). */
export type RentalDetail = RentalRecord & { documents: DocumentFile[] };

export type RentalFilters = {
  page: number;
  pageSize: number;
  q: string;
  status: RentalStatus | "";
};

export type ChargeAmounts = {
  /** What to show: due today (with fine/interest) if open, paid if settled. */
  amount: number;
  principal: number;
  surcharge: number;
  /** > 0 = paid less than due. */
  shortfall: number;
  isPaid: boolean;
};

export type Charge = {
  id: string;
  rentalId: string | null;
  customerId: string;
  purpose: string;
  label: string | null;
  method: string;
  status: string;
  channel: "asaas" | "manual";
  amount: number;
  dueDate: string;
  referenceDate: string | null;
  finePercent: number | null;
  interestPercent: number | null;
  surchargeFree: boolean;
  paidValue: number | null;
  /** Calendar date (midnight UTC), like dueDate: format with formatCalendarDate. */
  paidAt: string | null;
  /** Settled by the pix received on the rental (derived, not by hand). */
  settledByReceipt: boolean;
  amounts: ChargeAmounts;
  invoiceUrl: string | null;
  pix: { encodedImage: string; payload: string; expirationDate: string } | null;
  attachments: DocumentAttachment[];
  createdAt: string;
};

/** Body of POST/PUT /rentals (PUT replaces: omitted fields become empty). */
export type RentalInput = {
  customerId: string;
  vehicleId: string;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string | null;
  rate: number;
  ratePeriod: RatePeriod;
  paymentMethod: string | null;
  paymentWeekday: number | null;
  rentBillingTiming: "CYCLE_START" | "CYCLE_END";
  cautionType: Caution["type"] | null;
  cautionTotal: number | null;
  cautionInstallmentValue: number | null;
  cautionWeekday: number | null;
  cautionInstallments: CautionInstallment[] | null;
  notes: string | null;
  /** Create only. */
  status?: RentalStatus;
  /** Create only: MANUAL = retroactive (no contract, no billing, no vehicle move). */
  source?: "SYSTEM" | "MANUAL";
};

/** Codes of RENTAL_TERMINATION_REASON_LABELS ("OTHER" takes a text). */
export type TerminationReason = string;

/** How an ACTIVE rental ended early (staff view: reasons included). */
export type RentalTermination = {
  /** Calendar date (YYYY-MM-DD at midnight UTC). */
  date: string;
  reasons: TerminationReason[];
  otherReason: string | null;
  notes: string | null;
  byName: string | null;
  at: string;
};

/** GET /rentals/:id/termination/preview: what terminating on `date` does. */
export type TerminationPreview = {
  date: string;
  chargesToCancel: {
    id: string;
    dueDate: string;
    amount: number;
    channel: "asaas" | "manual";
    description: string | null;
    purpose: string;
  }[];
  autoBillingEnabled: boolean;
  vehicle: { id: string; plate: string } | null;
};

export type TerminationInput = {
  date: string;
  reasons: TerminationReason[];
  otherReason?: string;
  notes?: string;
};

export type TerminationResult = {
  rental: RentalRecord;
  cancelledCharges: { id: string }[];
  failures: { id: string; message: string }[];
};
