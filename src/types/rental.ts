import type { DocumentFile } from "@/types/document";

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
  customer: { id: string; name: string };
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
  attachments: Pick<DocumentFile, "id" | "category" | "fileName" | "url">[];
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
