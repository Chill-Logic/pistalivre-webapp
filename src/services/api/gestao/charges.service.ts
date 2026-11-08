import { http } from "@/services/http/client";
import type {
  ChargeSettleInput,
  ChargeSettlementInput,
  ChargeUpdateInput,
  RentalChargeInput,
} from "@/types/charge";
import type { Charge } from "@/types/rental";

const idempotent = (key: string) => ({
  headers: { "Idempotency-Key": key },
});

/**
 * Charges (money IN). Every write answers the same Charge shape as the
 * rental's list. Writes that issue or settle carry an Idempotency-Key.
 * Nothing here sends money out (owner's rule).
 */
export const chargesService = {
  async createForRental(
    rentalId: string,
    input: RentalChargeInput,
    key: string,
  ) {
    const { data } = await http.post<Charge>(
      `/rentals/${rentalId}/charges`,
      input,
      idempotent(key),
    );
    return data;
  },
  async update(id: string, input: ChargeUpdateInput) {
    const { data } = await http.put<Charge>(`/charges/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/charges/${id}`);
  },
  async settle(id: string, input: ChargeSettleInput, key: string) {
    const { data } = await http.post<Charge>(
      `/charges/${id}/settle`,
      input,
      idempotent(key),
    );
    return data;
  },
  async correctSettlement(id: string, input: ChargeSettlementInput) {
    const { data } = await http.put<Charge>(`/charges/${id}/settlement`, input);
    return data;
  },
  async setReferenceDate(id: string, referenceDate: string | null) {
    const { data } = await http.put<Charge>(`/charges/${id}/reference-date`, {
      referenceDate,
    });
    return data;
  },
};
