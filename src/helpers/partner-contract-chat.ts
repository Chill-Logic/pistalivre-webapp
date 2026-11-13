/** Starting points offered by the assistant on a partner contract (it asks for what's missing). */
export const PARTNER_CONTRACT_SUGGESTIONS = [
  "Colar a conversa com o combinado e montar o contrato",
  "Incluir a reavaliação a cada 3 meses",
  "Deixar a rescisão com aviso de 30 dias",
  "Revisar a linguagem jurídica",
];

/** Where a partner contract's conversation is saved (survives F5, follows the contract). */
export function partnerChatScope(contractId: string) {
  return `partner-contract:${contractId}`;
}

/** The "Novo contrato" conversation of a partner (moves to the contract once created). */
export function newPartnerContractChatScope(partnerId: string) {
  return `partner-contract-new:${partnerId}`;
}

/** The id of the contract a confirmed Livrinho action created, if that's what it did. */
export function createdPartnerContractId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const id = (result as { contrato_id?: unknown }).contrato_id;
  return typeof id === "string" && id ? id : null;
}
