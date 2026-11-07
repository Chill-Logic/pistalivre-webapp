import { onlyDigits } from "@/utils/masks";

/** Full CPF validation: length, repeated digits and both check digits. */
export function isValidCpf(value: string) {
  const c = onlyDigits(value);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) sum += Number(c[i]) * (length + 1 - i);
    const rest = 11 - (sum % 11);
    return rest >= 10 ? 0 : rest;
  };
  return digit(9) === Number(c[9]) && digit(10) === Number(c[10]);
}
