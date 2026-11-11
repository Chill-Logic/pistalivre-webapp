import { http } from "@/services/http/client";
import type {
  AutoBillingInput,
  AutoBillingResult,
  FirstChargePreview,
  BillingPeriod,
  DueChangeInput,
  DueChangePreview,
  RateSegmentInput,
  RateSegmentPreview,
  RentalBilling,
  RentCreditInput,
  RentReceiptInput,
  WaivedDayInput,
} from "@/types/billing";
import type { RatePeriod } from "@/types/rental";

const idempotent = (key: string) => ({ headers: { "Idempotency-Key": key } });

/**
 * Rent rules of a rental (auto-billing, values over time, skipped/waived
 * days, discounts, pix received, "count from"). Every write answers the
 * billing view; the reconciliation is the server's math, never redone here.
 */
export const billingService = {
  async get(rentalId: string, period?: BillingPeriod) {
    const { data } = await http.get<RentalBilling>(
      `/rentals/${rentalId}/billing`,
      { params: period },
    );
    return data;
  },
  async setAutoBilling(rentalId: string, input: AutoBillingInput, key: string) {
    const { data } = await http.put<AutoBillingResult>(
      `/rentals/${rentalId}/auto-billing`,
      input,
      idempotent(key),
    );
    return data;
  },
  async previewFirstCharge(rentalId: string, firstDueDate: string) {
    const { data } = await http.get<FirstChargePreview>(
      `/rentals/${rentalId}/auto-billing/first-charge`,
      { params: { firstDueDate } },
    );
    return data;
  },
  async previewRateSegment(
    rentalId: string,
    from: string,
    ratePeriod: RatePeriod,
  ) {
    const { data } = await http.get<RateSegmentPreview>(
      `/rentals/${rentalId}/rate-segments/preview`,
      { params: { from, ratePeriod } },
    );
    return data;
  },
  async addRateSegment(rentalId: string, input: RateSegmentInput, key: string) {
    const { data } = await http.post<{
      billing: RentalBilling;
      billed: number;
    }>(`/rentals/${rentalId}/rate-segments`, input, idempotent(key));
    return data;
  },
  async previewDueChange(rentalId: string, input: DueChangeInput) {
    const { data } = await http.get<DueChangePreview>(
      `/rentals/${rentalId}/due-change/preview`,
      { params: input },
    );
    return data;
  },
  async changeDue(rentalId: string, input: DueChangeInput, key: string) {
    const { data } = await http.post<{
      billing: RentalBilling;
      billed: number;
    }>(`/rentals/${rentalId}/due-change`, input, idempotent(key));
    return data;
  },
  async removeLastRateSegment(rentalId: string) {
    const { data } = await http.delete<RentalBilling>(
      `/rentals/${rentalId}/rate-segments/last`,
    );
    return data;
  },
  async setSkipWeekdays(rentalId: string, weekdays: number[]) {
    const { data } = await http.put<RentalBilling>(
      `/rentals/${rentalId}/skip-weekdays`,
      { weekdays },
    );
    return data;
  },
  async addWaivedDay(rentalId: string, input: WaivedDayInput) {
    const { data } = await http.post<RentalBilling>(
      `/rentals/${rentalId}/waived-days`,
      input,
    );
    return data;
  },
  async removeWaivedDay(rentalId: string, date: string) {
    const { data } = await http.delete<RentalBilling>(
      `/rentals/${rentalId}/waived-days/${date}`,
    );
    return data;
  },
  async addRentCredit(rentalId: string, input: RentCreditInput) {
    const { data } = await http.post<RentalBilling>(
      `/rentals/${rentalId}/rent-credits`,
      input,
    );
    return data;
  },
  async removeRentCredit(rentalId: string, creditId: string) {
    const { data } = await http.delete<RentalBilling>(
      `/rentals/${rentalId}/rent-credits/${creditId}`,
    );
    return data;
  },
  async setReconcileFrom(rentalId: string, from: string | null) {
    const { data } = await http.put<RentalBilling>(
      `/rentals/${rentalId}/reconcile-from`,
      { from },
    );
    return data;
  },
  async addRentReceipt(rentalId: string, input: RentReceiptInput, key: string) {
    const { data } = await http.post<RentalBilling>(
      `/rentals/${rentalId}/rent-receipts`,
      input,
      idempotent(key),
    );
    return data;
  },
  async removeRentReceipt(rentalId: string, receiptId: string) {
    const { data } = await http.delete<RentalBilling>(
      `/rentals/${rentalId}/rent-receipts/${receiptId}`,
    );
    return data;
  },
};
