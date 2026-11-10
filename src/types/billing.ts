import type { Charge, RatePeriod } from "@/types/rental";

/** One value of the rental from a date on (each day uses the one valid in it). */
export type RateSegment = {
  /** yyyy-mm-dd */
  from: string;
  rate: number;
  ratePeriod: RatePeriod;
  /** Part of the rate that pays the customer's debts (0 = none). */
  debtShare: number;
  debtSharePeriod: RatePeriod;
  /** Starts a new cycle without changing the period (a due-day change). */
  restart?: boolean;
};

export type WaivedDay = {
  date: string;
  reason: string | null;
  showInReport: boolean;
};

export type RentCredit = {
  id: string;
  date: string;
  amount: number;
  reason: string;
  showInReport: boolean;
};

/** A pix that landed in OUR account for this rental (money IN only). */
export type RentReceipt = {
  id: string;
  amount: number;
  /** Calendar date. */
  receivedAt: string;
  notes: string | null;
  createdAt: string;
};

/** The server's rent reconciliation (management's `reconcileRent`). */
export type RentReconciliation = {
  from: string;
  fromIsManual: boolean;
  filtered: boolean;
  through: string;
  billableDays: number;
  skippedWeekdays: number;
  waivedDays: number;
  rate: number;
  ratePeriod: RatePeriod;
  mixedRates: boolean;
  cyclesByPeriod: Partial<Record<RatePeriod, number>>;
  /** Cycle still running (not due yet: out of the balance). */
  current: {
    start: string;
    end: string;
    due: string;
    period: RatePeriod;
    accrued: number;
    amount: number;
  } | null;
  expected: number;
  charged: number;
  chargedCount: number;
  paid: number;
  paidCount: number;
  credits: number;
  creditCount: number;
  open: number;
  openCount: number;
  /** > 0 owes, < 0 paid ahead. */
  balance: number;
};

/**
 * GET /rentals/:id/billing — everything the rent-rule cards read. Every
 * rule write answers this same body, so one response refreshes them all.
 */
export type RentalBilling = {
  rentalId: string;
  /** yyyy-mm-dd in Brasília. */
  today: string;
  ratePeriod: RatePeriod;
  autoBilling: {
    enabled: boolean;
    channel: "asaas" | "manual";
    timing: "CYCLE_START" | "CYCLE_END";
    canEnable: boolean;
    nextDueDate: string | null;
    nextAmount: number | null;
  };
  rateSegments: {
    items: RateSegment[];
    current: RateSegment;
    /** A new segment must start AFTER this day. */
    minFrom: string;
    /** First day not covered by the last rent charge. */
    firstUncovered: string | null;
    debtsSettled: boolean;
  };
  /** "Trocar vencimento": the last day of the month it accepts. */
  dueChange: { maxMonthDay: number };
  skipWeekdays: number[];
  waivedDays: WaivedDay[];
  rentCredits: RentCredit[];
  reconcileFrom: string | null;
  receipts: { items: RentReceipt[]; credit: number };
  reconciliation: RentReconciliation | null;
  paidThrough: string | null;
  debtPart: number;
  period: { from: string | null; through: string | null };
  /**
   * Order of the "Cobranças" list, newest first, with the waived days in
   * between (otherwise a waived day reads as a hole).
   */
  timeline?: BillingTimelineEntry[];
};

export type BillingTimelineEntry =
  | { kind: "charge"; date: string; chargeId: string }
  | {
      kind: "waived";
      date: string;
      reason: string | null;
      showInReport: boolean;
    };

export type BillingPeriod = { from: string; through: string };

export type AutoBillingInput = {
  enabled: boolean;
  channel?: "asaas" | "manual";
  firstDueDate?: string;
};

export type AutoBillingResult = {
  billing: RentalBilling;
  firstCharge: Charge | null;
  /** Turned on, but the first charge failed at Asaas (it stays on). */
  firstChargeError: string | null;
};

export type RateSegmentInput = {
  from: string;
  rate: number;
  ratePeriod: RatePeriod;
  debtShare?: number;
  debtSharePeriod?: RatePeriod;
};

/** Server preview of a change of periodicity (same function as management). */
export type RateSegmentPreview = {
  periodChanged: boolean;
  preview: {
    start: string;
    firstDue: string;
    shiftedFrom: string | null;
    catchUp: number;
    partialFrom: string | null;
  } | null;
};

export type WaivedDayInput = {
  date: string;
  reason?: string;
  showInReport?: boolean;
};

export type RentCreditInput = {
  date: string;
  amount: number;
  reason: string;
  showInReport?: boolean;
};

export type RentReceiptInput = {
  amount: number;
  receivedAt: string;
  notes?: string;
};

/** Body of POST /rentals/:id/due-change (and the preview's query). */
export type DueChangeInput = {
  ratePeriod: RatePeriod;
  /** Weekly: the weekday it falls due (0 = Sunday). */
  weekday?: number;
  /** Monthly: the day of the month it falls due. */
  monthDay?: number;
  rate: number;
  /** yyyy-mm-dd: not before this day (absent = as soon as possible). */
  notBefore?: string;
};

export type DueChangeCycle = {
  start: string;
  end: string;
  due: string;
  amount: number;
};

/** What a due change will do, by the server (GET .../due-change/preview). */
export type DueChangePreview = {
  plan: {
    from: string;
    /** The old cycle's piece until the change, charged on its own. */
    bridge: DueChangeCycle | null;
    /** The first cycle on the new due day. */
    first: DueChangeCycle;
    /** Whole old cycles already due with no charge (the change doesn't issue them). */
    uncharged: number;
  };
  /** Open rent charges past due: they stay as they are, late fee included. */
  overdue: { id: string; dueDate: string; amount: number }[];
  autoBilling: boolean;
};
