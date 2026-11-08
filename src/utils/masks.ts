/** Input masks (pure formatting). Validation lives in utils/cpf and the schemas. */

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** 000.000.000-00 */
export function maskCpf(value: string) {
  const c = onlyDigits(value).slice(0, 11);
  let out = c.slice(0, 3);
  if (c.length > 3) out += `.${c.slice(3, 6)}`;
  if (c.length > 6) out += `.${c.slice(6, 9)}`;
  if (c.length > 9) out += `-${c.slice(9, 11)}`;
  return out;
}

/** (00) 00000-0000 (mobile) or (00) 0000-0000 (landline). */
export function maskPhone(value: string) {
  const c = onlyDigits(value).slice(0, 11);
  const ddd = c.slice(0, 2);
  if (c.length <= 2) return ddd ? `(${ddd}` : "";
  const rest = c.slice(2);
  const firstLength = rest.length > 8 ? 5 : 4;
  const first = rest.slice(0, firstLength);
  const second = rest.slice(firstLength);
  return second ? `(${ddd}) ${first}-${second}` : `(${ddd}) ${first}`;
}

/** 00000-000 */
export function maskCep(value: string) {
  const c = onlyDigits(value).slice(0, 8);
  return c.length > 5 ? `${c.slice(0, 5)}-${c.slice(5)}` : c;
}

/** 00.000.000-0 (an X is accepted as the last check digit). */
export function maskRg(value: string) {
  const c = value
    .replace(/[^\dxX]/g, "")
    .toUpperCase()
    .slice(0, 9);
  let out = c.slice(0, 2);
  if (c.length > 2) out += `.${c.slice(2, 5)}`;
  if (c.length > 5) out += `.${c.slice(5, 8)}`;
  if (c.length > 8) out += `-${c.slice(8, 9)}`;
  return out;
}

/** dd/mm/aaaa */
export function maskDate(value: string) {
  const c = onlyDigits(value).slice(0, 8);
  let out = c.slice(0, 2);
  if (c.length > 2) out += `/${c.slice(2, 4)}`;
  if (c.length > 4) out += `/${c.slice(4, 8)}`;
  return out;
}

/** 00.000.000/0000-00 (digits only; the API also takes the alphanumeric one). */
export function maskCnpj(value: string) {
  const c = value
    .replace(/[^0-9A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 14);
  let out = c.slice(0, 2);
  if (c.length > 2) out += `.${c.slice(2, 5)}`;
  if (c.length > 5) out += `.${c.slice(5, 8)}`;
  if (c.length > 8) out += `/${c.slice(8, 12)}`;
  if (c.length > 12) out += `-${c.slice(12, 14)}`;
  return out;
}

/** Pix key as the renter types it: CPF/CNPJ/phone masked, e-mail/random as is. */
export function maskPixKey(type: string, value: string) {
  if (type === "CPF") return maskCpf(value);
  if (type === "CNPJ") return maskCnpj(value);
  if (type === "PHONE") return maskPhone(value);
  return value.trim();
}
