import { http } from "@/services/http/client";
import type {
  AsaasNotification,
  AsaasNotificationsView,
  CustomerFlags,
} from "@/types/customer-settings";

/** Flags of the customer record and its Asaas notifications. */
export const customerSettingsService = {
  async setFlags(customerId: string, flags: Partial<CustomerFlags>) {
    const { data } = await http.patch<CustomerFlags>(
      `/customers/${customerId}/flags`,
      flags,
    );
    return data;
  },
  async notifications(customerId: string) {
    const { data } = await http.get<AsaasNotificationsView>(
      `/customers/${customerId}/notifications`,
    );
    return data;
  },
  /** Rewrites them at Asaas: not linked → 422; Asaas refusing → 502. */
  async saveNotifications(customerId: string, items: AsaasNotification[]) {
    const { data } = await http.put<AsaasNotificationsView>(
      `/customers/${customerId}/notifications`,
      { items },
    );
    return data;
  },
};
