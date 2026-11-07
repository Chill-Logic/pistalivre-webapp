const BRASILIA = "America/Sao_Paulo";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** R$ 1.234,56 */
export function formatCurrency(value: number) {
  return currency.format(value);
}

/** Timestamps (createdAt, lastLoginAt…) in Brasília time. */
export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: BRASILIA });
}

/**
 * Calendar dates (startDate, dueDate…) are stored at midnight UTC: format in
 * UTC or the day slides back one in Brazil.
 */
export function formatCalendarDate(value: string | Date) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** First name for greetings ("Olá, Maria"). */
export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
