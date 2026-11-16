/** The rental periodicities that have an Asaas notification template. */
export type TemplatePeriod = "WEEKLY" | "MONTHLY" | "DAILY";

/** The 8 blocks of Asaas's notification screen. */
export type NotificationSlot =
  | "CREATED"
  | "UPDATED"
  | "DUE_BEFORE"
  | "DUE_TODAY"
  | "LINHA"
  | "OVERDUE"
  | "OVERDUE_REPEAT"
  | "RECEIVED";

export type SlotConfig = {
  /** DUE_BEFORE: days before the due date; OVERDUE_REPEAT: every N days. */
  offset: number;
  /** "Para mim" (the company). */
  providerEmail: boolean;
  providerSms: boolean;
  /** "Para o cliente". */
  customerWhatsapp: boolean;
  customerEmail: boolean;
  customerSms: boolean;
  customerPhoneCall: boolean;
};

export type NotificationSlots = Record<NotificationSlot, SlotConfig>;

export type NotificationTemplateItem = {
  period: TemplatePeriod;
  slots: NotificationSlots;
  updatedAt: string | null;
};

export type NotificationTemplatesResponse = {
  items: NotificationTemplateItem[];
  /** Days Asaas offers per block (DUE_BEFORE, OVERDUE_REPEAT). */
  offsets: Partial<Record<NotificationSlot, number[]>>;
};

/** The customer's Asaas notifications, read as the same blocks. */
export type CustomerNotificationSlotsView = {
  slots: Partial<NotificationSlots> | null;
  linked: boolean;
  /** Template their live rental calls for (null = no live rental). */
  suggestedPeriod: TemplatePeriod | null;
  /** The setting already is that template: nothing to apply. */
  matchesSuggested?: boolean;
  /** "Desligar todas as notificações" is on: Asaas warns this customer of nothing. */
  allDisabled?: boolean;
  error: string | null;
  applied?: TemplatePeriod;
};
