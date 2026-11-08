import { http } from "@/services/http/client";
import { toQueryParams } from "@/helpers/query-params";
import type {
  DebtDetail,
  DebtFilters,
  DebtInput,
  DebtPaymentInput,
  DebtPaymentPreview,
  DebtPaymentPreviewInput,
  DebtPreview,
  DebtPreviewInput,
  Debts,
} from "@/types/debt";

/**
 * Company debts (what the company owes). Writes answer the debt detail.
 * A payment records money paid outside the system: nothing is sent from here.
 */
export const debtsService = {
  async list(filters: DebtFilters) {
    const { data } = await http.get<Debts>("/debts", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<DebtDetail>(`/debts/${id}`);
    return data;
  },
  async create(input: DebtInput) {
    const { data } = await http.post<DebtDetail>("/debts", input);
    return data;
  },
  async update(id: string, input: DebtInput) {
    const { data } = await http.put<DebtDetail>(`/debts/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/debts/${id}`);
  },
  /** Interest and plan "as of today" of a draft (nothing is saved). */
  async preview(input: DebtPreviewInput) {
    const { data } = await http.post<DebtPreview>("/debts/preview", input);
    return data;
  },
  /** What a payment would leave open (nothing is saved). */
  async previewPayment(id: string, input: DebtPaymentPreviewInput) {
    const { data } = await http.post<DebtPaymentPreview>(
      `/debts/${id}/payments/preview`,
      input,
    );
    return data;
  },
  async addPayment(id: string, input: DebtPaymentInput, key: string) {
    const { data } = await http.post<{ paymentId: string; debt: DebtDetail }>(
      `/debts/${id}/payments`,
      input,
      { headers: { "Idempotency-Key": key } },
    );
    return data;
  },
  async removePayment(paymentId: string) {
    const { data } = await http.delete<DebtDetail>(
      `/debt-payments/${paymentId}`,
    );
    return data;
  },
};
