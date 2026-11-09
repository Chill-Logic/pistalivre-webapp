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

const usd = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

// Under a cent: the 6 decimals the server stores, or a tiny call shows as 0,00.
const usdTiny = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

/** US$ 0,1787 · US$ 0,000005 — AI costs are tiny per call. */
export function formatUsd(value: number) {
  return (value > 0 && value < 0.01 ? usdTiny : usd).format(value);
}

/** 14.020 */
export function formatInteger(value: number) {
  return integer.format(value);
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

/** "há 5 min", "há 3 h", "há 2 dias"; past a month, the date. */
export function formatRelativeTime(value: string | Date, now = Date.now()) {
  const minutes = Math.floor((now - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "agora há pouco";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 31) return days === 1 ? "há 1 dia" : `há ${days} dias`;
  return `em ${formatDate(value)}`;
}

/** First name for greetings ("Olá, Maria"). */
export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
