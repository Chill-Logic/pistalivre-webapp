/**
 * CNPJ check, legacy (14 digits) and the new alphanumeric one: positions
 * 1–12 take A–Z/0–9, the 2 check digits stay numeric (mod 11 over
 * `charCode − 48`). Mirrors the API's rule.
 */
const DV1_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const DV2_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Without the mask, upper case (the form the API stores). */
export function normalizeCnpj(value: string) {
  return value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

export function isValidCnpj(value: string) {
  const c = normalizeCnpj(value);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) return false;
  const digit = (base: string, weights: number[]) => {
    const sum = weights.reduce(
      (total, weight, index) => total + (base.charCodeAt(index) - 48) * weight,
      0,
    );
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return (
    digit(c.slice(0, 12), DV1_WEIGHTS) === Number(c[12]) &&
    digit(c.slice(0, 13), DV2_WEIGHTS) === Number(c[13])
  );
}
