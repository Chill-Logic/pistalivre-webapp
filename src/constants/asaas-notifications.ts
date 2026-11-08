import type { AsaasNotificationChannel } from "@/types/customer-settings";

/** Channels Asaas uses to warn the customer, in the order shown. */
export const ASAAS_NOTIFICATION_CHANNELS: {
  key: AsaasNotificationChannel;
  label: string;
}[] = [
  { key: "emailEnabledForCustomer", label: "E-mail" },
  { key: "smsEnabledForCustomer", label: "SMS" },
  { key: "whatsappEnabledForCustomer", label: "WhatsApp" },
  { key: "phoneCallEnabledForCustomer", label: "Ligação" },
];

/**
 * Events whose row has a schedule (days before/after the due date), with the
 * words after the number. The other events go out on the spot.
 */
export const ASAAS_SCHEDULED_EVENTS: Record<string, string> = {
  PAYMENT_DUEDATE_WARNING: "dias antes",
  PAYMENT_OVERDUE: "dias depois",
};

/** The schedule Asaas accepts, in days. */
export const ASAAS_SCHEDULE_MAX_DAYS = 30;
