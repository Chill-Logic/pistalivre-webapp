import { http } from "@/services/http/client";
import type {
  CustomerNotificationSlotsView,
  NotificationSlots,
  NotificationTemplatesResponse,
  TemplatePeriod,
} from "@/types/asaas-notification-template";

/** Asaas notification templates (by rental periodicity) and a customer's own setting. */
export const asaasNotificationsService = {
  async templates() {
    const { data } = await http.get<NotificationTemplatesResponse>("/asaas-notification-templates");
    return data;
  },
  /** Admin only. */
  async saveTemplate(period: TemplatePeriod, slots: NotificationSlots) {
    const { data } = await http.put<{ period: TemplatePeriod; slots: NotificationSlots }>(
      `/asaas-notification-templates/${period}`,
      { slots },
    );
    return data;
  },
  async customer(customerId: string) {
    const { data } = await http.get<CustomerNotificationSlotsView>(`/customers/${customerId}/notifications`);
    return data;
  },
  /** Rewrites the customer's notifications at Asaas (a hand edit). */
  async saveCustomer(customerId: string, slots: Partial<NotificationSlots>) {
    const { data } = await http.put<CustomerNotificationSlotsView>(`/customers/${customerId}/notifications`, {
      slots,
    });
    return data;
  },
  /** Applies a template (absent = the one of the live rental). */
  async applyTemplate(customerId: string, period?: TemplatePeriod) {
    const { data } = await http.post<CustomerNotificationSlotsView>(
      `/customers/${customerId}/notifications/apply-template`,
      period ? { period } : {},
    );
    return data;
  },
};
