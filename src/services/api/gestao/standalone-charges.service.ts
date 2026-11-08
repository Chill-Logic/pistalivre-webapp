import type { AsaasCharges } from "@/types/asaas-charge";
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
  /** Every charge of the customer at Asaas (Asaas down → items [] + error). */
  async asaasCharges(customerId: string) {
    const { data } = await http.get<AsaasCharges>(
      `/customers/${customerId}/asaas-charges`,
    );
    return data;
  },
  /**
   * OUR charges of the customer, both channels, with or without a rental
   * (the manual ones outside Asaas show up only here). `id` here is the
   * `paymentId` of the Asaas list.
   */
  async customerCharges(customerId: string) {
    const { data } = await http.get<{ items: Charge[] }>(
      `/customers/${customerId}/charges`,
    );
    return data.items;
  },
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
