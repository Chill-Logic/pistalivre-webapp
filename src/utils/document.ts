/** 12345678901 → 123.456.789-01; anything else (already masked) as is. */
export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || value.includes("*")) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/** 01234567 → 01234-567 */
export function formatZip(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : value;
}

/** 21999990000 → (21) 99999-0000; anything else as is. */
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
}

/**
 * CNPJ (numeric or the new alphanumeric, IN RFB 2.229/2024):
 * AB12CD34000156 → AB.12C.D34/0001-56; anything else as is.
 */
export function formatCnpj(value: string) {
  const clean = value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (clean.length !== 14) return value;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}
