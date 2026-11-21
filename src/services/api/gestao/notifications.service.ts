import { http } from "@/services/http/client";
import type {
  GroupNoticeOverview,
  GroupNoticeSettings,
  MyNotificationSettings,
  NotificationAdminOverview,
  NotificationList,
  NotificationPreferenceInput,
  PushSubscriptionInput,
} from "@/types/notification";

export const notificationsService = {
  /** The person's bell, newest first, with the unread count; `before` pages back. */
  async list(limit = 30, before?: string | null) {
    const { data } = await http.get<NotificationList>("/notifications", {
      params: { limit, ...(before ? { before } : {}) },
    });
    return data;
  },
  /** No ids = all of the person's. */
  async markRead(ids?: string[]) {
    const { data } = await http.post<{ unread: number }>("/notifications/read", ids ? { ids } : {});
    return data;
  },
  async settings() {
    const { data } = await http.get<MyNotificationSettings>("/notifications/settings");
    return data;
  },
  async saveSettings(types: NotificationPreferenceInput) {
    const { data } = await http.put<MyNotificationSettings>("/notifications/settings", { types });
    return data;
  },
  /** Integrações › WhatsApp › Avisos no grupo (ADMIN). */
  async groupNotices() {
    const { data } = await http.get<GroupNoticeOverview>("/notifications/admin/whatsapp");
    return data;
  },
  async saveGroupNotices(settings: GroupNoticeSettings) {
    const { data } = await http.put<{ settings: GroupNoticeSettings }>("/notifications/admin/whatsapp", settings);
    return data.settings;
  },
  async testGroupNotice() {
    await http.post("/notifications/admin/whatsapp/test");
  },
  async admin() {
    const { data } = await http.get<NotificationAdminOverview>("/notifications/admin");
    return data;
  },
  async saveRole(role: string, types: string[]) {
    const { data } = await http.put<NotificationAdminOverview>(`/notifications/admin/roles/${role}`, { types });
    return data;
  },
  async saveDigestHour(digestHour: number) {
    const { data } = await http.put<NotificationAdminOverview>("/notifications/admin/config", { digestHour });
    return data;
  },
  async subscribePush(subscription: PushSubscriptionInput) {
    await http.post("/notifications/push", subscription);
  },
  async unsubscribePush(endpoint: string) {
    await http.delete("/notifications/push", { data: { endpoint } });
  },
  async sendTest() {
    const { data } = await http.post<{ devices: number }>("/notifications/test");
    return data;
  },
};
