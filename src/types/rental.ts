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

export type RentalDetail = RentalListItem & {
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
  purpose: string;
  label: string | null;
  method: string;
  status: string;
  channel: "asaas" | "manual";
  amount: number;
  dueDate: string;
  referenceDate: string | null;
  surchargeFree: boolean;
  paidValue: number | null;
  paidAt: string | null;
  amounts: ChargeAmounts;
  invoiceUrl: string | null;
  pix: { encodedImage: string; payload: string; expirationDate: string } | null;
  attachments: Pick<DocumentFile, "id" | "category" | "fileName" | "url">[];
  createdAt: string;
};
