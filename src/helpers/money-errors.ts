import { toApiError, type ApiError } from "@/helpers/api-error";

/**
 * What a money write error means for the person (contract in api-v1.md):
 * - PROVIDER_ERROR: Asaas refused or is down, nothing was saved → fix/retry;
 * - NOT_RECORDED: Asaas created it but our database failed → do NOT retry,
 *   "Sincronizar do Asaas" brings it back.
 */
export function moneyErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.code === "PROVIDER_ERROR") {
    return `O Asaas recusou: ${apiError.message}. Nada foi gravado; corrija e tente de novo.`;
  }
  if (apiError.code === "NOT_RECORDED") {
    return "A cobrança foi criada no Asaas, mas não ficou registrada aqui. Não emita de novo: use “Sincronizar do Asaas” no Financeiro.";
  }
  return apiError.message;
}

/** Sending again would duplicate the charge. */
export function isNotRecorded(error: unknown) {
  return toApiError(error).code === "NOT_RECORDED";
}

export type { ApiError };

/**
 * Batch 422s come per line (`items.2.dueDate`): the message of each line,
 * by its index in the `items` that were sent.
 */
export function itemFieldErrors(fields: Record<string, string> = {}) {
  const byIndex: Record<number, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    const match = /^items\.(\d+)\./.exec(key);
    if (match) byIndex[Number(match[1])] = message;
  }
  return byIndex;
}
