import { toApiError } from "@/helpers/api-error";

const TOO_MANY_LOOKUPS =
  "Muitas consultas de chave pix em pouco tempo (o banco central limita por minuto). Aguarde um minuto e tente de novo.";

/**
 * Where a wallet error goes in the add dialog: a key the DICT did not find
 * stays on the field; the per-minute lookup limit gets a clear message (the
 * API answers it as 429 or as a 422 "Muitas consultas").
 */
export function pixKeyError(error: unknown): {
  pixKey?: string;
  form?: string;
} {
  const apiError = toApiError(error);
  if (apiError.status === 429 || /muitas consultas/i.test(apiError.message)) {
    return { form: TOO_MANY_LOOKUPS };
  }
  return apiError.fields?.pixKey
    ? { pixKey: apiError.fields.pixKey }
    : { form: apiError.message };
}
