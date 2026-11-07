/** ABC1234 → ABC-1234; Mercosul (ABC1D23) stays as is, which is how it's printed. */
export function formatPlate(plate: string) {
  const value = plate.toUpperCase();
  return /^[A-Z]{3}\d{4}$/.test(value)
    ? `${value.slice(0, 3)}-${value.slice(3)}`
    : value;
}
