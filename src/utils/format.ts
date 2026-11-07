const BRASILIA = "America/Sao_Paulo";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const integer = new Intl.NumberFormat("pt-BR");

/** R$ 1.234,56 */
export function formatCurrency(value: number) {
  return currency.format(value);
}

/** 12.345 km */
export function formatMileage(km: number) {
  return `${integer.format(km)} km`;
}

/** 1,2 MB */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${units[unit]}`;
}

/** Timestamps (createdAt, lastLoginAt…) in Brasília time. */
export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: BRASILIA });
}

/** Timestamp as a date only, in Brasília time. */
export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: BRASILIA });
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
