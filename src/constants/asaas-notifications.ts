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

/** Name of each Asaas notification template (by the rental periodicity). */
export const TEMPLATE_PERIOD_LABEL: Record<import("@/types/asaas-notification-template").TemplatePeriod, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  DAILY: "Diária",
};

/** The blocks of Asaas notification screen, grouped as Asaas shows them. */
export const NOTIFICATION_SLOT_GROUPS: {
  title: string;
  slots: {
    slot: import("@/types/asaas-notification-template").NotificationSlot;
    title: string;
    /** Title with the days choice: text before and after the select. */
    offset?: { before: string; after: string };
    hint: string;
  }[];
}[] = [
  {
    title: "Antes do vencimento",
    slots: [
      { slot: "CREATED", title: "Avisar criação de novas cobranças", hint: "Quando a cobrança é gerada." },
      { slot: "UPDATED", title: "Avisar alteração no valor ou no vencimento", hint: "Quando a cobrança muda de valor ou de data." },
      { slot: "DUE_BEFORE", title: "", offset: { before: "Enviar a cobrança", after: "antes do vencimento" }, hint: "Lembrete antes de vencer." },
      { slot: "DUE_TODAY", title: "Enviar cobranças pendentes no dia do vencimento", hint: "Se ainda não foi paga." },
      { slot: "LINHA", title: "Enviar a linha digitável do boleto", hint: "No vencimento, se o boleto não foi impresso." },
    ],
  },
  {
    title: "Cobranças vencidas",
    slots: [
      { slot: "OVERDUE", title: "Avisar sobre atrasos e falhas no pagamento", hint: "Quando o cliente deixa de pagar." },
      { slot: "OVERDUE_REPEAT", title: "", offset: { before: "Relembrar cobranças vencidas a cada", after: "" }, hint: "Até 3 vezes, enquanto não for paga." },
    ],
  },
  {
    title: "Cobranças pagas",
    slots: [{ slot: "RECEIVED", title: "Avisar quando o pagamento for confirmado", hint: "Recibo do pagamento." }],
  },
];
