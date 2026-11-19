import { http } from "@/services/http/client";
import type {
  CustomerDebtInput,
  CustomerDebtPaymentInput,
  CustomerDebtsView,
  TransferRentBalanceInput,
} from "@/types/customer-debt";

/**
 * What a customer owes the company (damages, traffic fines…), paid down by
 * the rent's debt share or directly. Every write answers the whole view.
 */
export const customerDebtsService = {
  async view(customerId: string) {
    const { data } = await http.get<CustomerDebtsView>(
      `/customers/${customerId}/debts`,
    );
    return data;
  },
  async create(customerId: string, input: CustomerDebtInput) {
    const { data } = await http.post<CustomerDebtsView>(
      `/customers/${customerId}/debts`,
      input,
    );
    return data;
  },
  async update(id: string, input: CustomerDebtInput) {
    const { data } = await http.put<CustomerDebtsView>(
      `/customer-debts/${id}`,
      input,
    );
    return data;
  },
  async remove(id: string) {
    const { data } = await http.delete<CustomerDebtsView>(
      `/customer-debts/${id}`,
    );
    return data;
  },
  async addPayment(id: string, input: CustomerDebtPaymentInput, key: string) {
    const { data } = await http.post<CustomerDebtsView>(
      `/customer-debts/${id}/payments`,
      input,
      { headers: { "Idempotency-Key": key } },
    );
    return data;
  },
  /** Moves an ended rental's open rent into a customer debt (and zeroes the rental). */
  async transferRentBalance(rentalId: string, input: TransferRentBalanceInput) {
    const { data } = await http.post<{ debtId: string; debts: CustomerDebtsView }>(
      `/rentals/${rentalId}/transfer-balance`,
      input,
    );
    return data.debts;
  },
  async removePayment(paymentId: string) {
    const { data } = await http.delete<CustomerDebtsView>(
      `/customer-debt-payments/${paymentId}`,
    );
    return data;
  },
};
