import { AI_AUDIT_CHANNEL_LABELS, AI_AUDIT_METHOD_LABELS } from "@/constants/integrations";
import type { AiAuditEntry } from "@/types/ai";

/** "Ferramenta: Buscar locações" / "Token renovado". */
export function auditEvent(entry: AiAuditEntry, toolTitle: (name: string) => string) {
  const method = AI_AUDIT_METHOD_LABELS[entry.method] ?? entry.method;
  return entry.tool ? `${method}: ${toolTitle(entry.tool)}` : method;
}

export function auditChannel(entry: AiAuditEntry) {
  return AI_AUDIT_CHANNEL_LABELS[entry.channel] ?? entry.channel;
}

/** Who and through what: "Ana · Claude" / "Ana · chat do sistema". */
export function auditWho(entry: AiAuditEntry) {
  const app = entry.clientName ?? (entry.channel === "chat" ? "chat do sistema" : null);
  return [entry.userName ?? (entry.userId ? "Usuário removido" : null), app].filter(Boolean).join(" · ") || "—";
}
