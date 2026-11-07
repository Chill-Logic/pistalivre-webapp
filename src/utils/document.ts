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
