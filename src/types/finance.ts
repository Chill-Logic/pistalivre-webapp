import type { ChargeAmounts } from "@/types/rental";

/** A charge waiting to be received (due today or already overdue). */
export type ToCollectItem = {
  id: string;
  purpose: string;
  label: string | null;
  method: string;
  status: string;
  channel: "asaas" | "manual";
  dueDate: string;
  amounts: ChargeAmounts;
  customer: { id: string; name: string } | null;
  rental: { id: string; code: string } | null;
  /** Only on an open Asaas charge. */
  invoiceUrl: string | null;
  pix: { encodedImage: string; payload: string; expirationDate: string } | null;
};

export type ToCollectDay = {
  /** yyyy-mm-dd (calendar day). */
  dueDate: string;
  /** 0 = due today (Brasília). */
  daysLate: number;
  total: number;
  items: ToCollectItem[];
};

/** Collection queue: today on top, the oldest delay at the bottom. */
export type ToCollect = {
  total: number;
  count: number;
  days: ToCollectDay[];
};
