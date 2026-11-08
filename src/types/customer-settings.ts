/** PATCH /customers/:id/flags: send at least one. */
export type CustomerFlags = {
  /** Hidden from the customer list by default (visibility, not metrics). */
  isTest: boolean;
  /** Charges left out of the delinquency metrics. */
  excludeFromMetrics: boolean;
};

/** Channels Asaas uses to warn the customer about one event. */
export type AsaasNotificationChannel =
  | "emailEnabledForCustomer"
  | "smsEnabledForCustomer"
  | "whatsappEnabledForCustomer"
  | "phoneCallEnabledForCustomer";

/**
 * One Asaas notification of the customer. Asaas may hold more than one row
 * per event, with different schedules (e.g. overdue on the day and 3 days
 * later): the offset is part of the row's identity.
 */
export type AsaasNotification = Record<AsaasNotificationChannel, boolean> & {
  id: string;
  event: string;
  enabled: boolean;
  /** Days before/after (only some events use it). */
  scheduleOffset: number;
};

/** Read-through of Asaas: nothing is mirrored here. */
export type AsaasNotificationsView = {
  items: AsaasNotification[];
  /** false = the customer is not at Asaas yet. */
  linked: boolean;
  /** Asaas did not answer: items come empty. */
  error: string | null;
};
