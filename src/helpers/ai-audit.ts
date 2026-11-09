import {
  AI_AUDIT_CHANNEL_LABELS,
  AI_AUDIT_METHOD_LABELS,
  AI_GAP_REASON_LABELS,
} from "@/constants/integrations";
import type { AiAuditEntry } from "@/types/ai";

/** "Ferramenta: Buscar locações" / "Token renovado" / "Pergunta sem resposta". */
export function auditEvent(
  entry: AiAuditEntry,
  toolTitle: (name: string) => string,
) {
  const method = AI_AUDIT_METHOD_LABELS[entry.method] ?? entry.method;
  return entry.tool && entry.method !== "gap.report"
    ? `${method}: ${toolTitle(entry.tool)}`
    : method;
}

/** What a gap report says (its input): the question, why, and what was missing. */
export function auditGap(entry: AiAuditEntry) {
  const input =
    typeof entry.input === "object" && entry.input !== null
      ? (entry.input as Record<string, unknown>)
      : {};
  const text = (key: string) =>
    typeof input[key] === "string" ? (input[key] as string) : "";
  const reason = text("motivo") || "sem_motivo";
  return {
    question: text("pergunta"),
    reason: AI_GAP_REASON_LABELS[reason] ?? reason,
    detail: text("detalhe"),
  };
}

export function auditChannel(entry: AiAuditEntry) {
  return AI_AUDIT_CHANNEL_LABELS[entry.channel] ?? entry.channel;
}

/** Who and through what: "Ana · Claude" / "Ana · chat do sistema". */
export function auditWho(entry: AiAuditEntry) {
  const app =
    entry.clientName ?? (entry.channel === "chat" ? "chat do sistema" : null);
  return (
    [entry.userName ?? (entry.userId ? "Usuário removido" : null), app]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}
