import { http } from "@/services/http/client";
import type {
  FinanceSyncResult,
  ManualChargeInput,
  StandaloneChargeInput,
  StandaloneChargeResult,
} from "@/types/standalone-charge";
import type { Charge } from "@/types/rental";

const idempotent = (key: string) => ({
  headers: { "Idempotency-Key": key },
});

/**
 * Charges outside a rental's own flow: issued from the Financeiro/customer
 * record, payments received outside Asaas, linking an Asaas charge made
 * elsewhere, and "Sincronizar do Asaas". Money only comes IN.
 */
export const standaloneChargesService = {
  async create(input: StandaloneChargeInput, key: string) {
    const { data } = await http.post<StandaloneChargeResult>(
      "/charges",
      input,
      idempotent(key),
    );
    return data;
  },
  async createManual(input: ManualChargeInput, key: string) {
    const { data } = await http.post<Charge>(
      "/charges/manual",
      input,
      idempotent(key),
    );
    return data;
  },
  /** `chargeId` is the Asaas id (pay_…). Our copy comes on the next sync. */
  async link(chargeId: string, rentalId: string) {
    await http.post(`/charges/${chargeId}/link`, { rentalId });
  },
  /** Brings missed webhooks and NOT_RECORDED charges back. Can take a while. */
  async sync() {
    const { data } = await http.post<FinanceSyncResult>(
      "/finance/sync",
      {},
      {
        timeout: 120_000,
      },
    );
    return data;
  },
};
