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
