/** One notice of the bell (GET /notifications and the `notification.created` socket event). */
export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  /** The screen that resolves it, with the area prefix (e.g. /gestao/reembolsos). */
  url: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationList = {
  items: AppNotification[];
  unread: number;
};

export type NotificationGroup = "Dinheiro" | "Operação" | "Comercial" | "Resumo";

export type NotificationTypeInfo = {
  type: string;
  group: NotificationGroup;
  title: string;
  description: string;
};

/** The person's settings: what their group allows (admin) and what they chose. */
export type MyNotificationSettings = {
  types: (NotificationTypeInfo & { allowed: boolean; enabled: boolean; push: boolean })[];
  /** null = push not configured on the server. */
  pushPublicKey: string | null;
  digestHour: number;
  devices: number;
};

export type NotificationPreferenceInput = Record<string, { enabled?: boolean; push?: boolean }>;

/** The admin's screen: what each group may receive and the digest hour. */
export type NotificationAdminOverview = {
  types: NotificationTypeInfo[];
  roles: Record<string, string[]>;
  digestHour: number;
};

/** A browser push subscription, as the server stores it. */
export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
