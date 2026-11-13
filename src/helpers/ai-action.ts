import type { AiActionItem, AiActionStatus } from "@/types/ai";

type BadgeVariant = "neutral" | "success" | "warning" | "error" | "outline";

/** How each state of a proposed write shows (card, table and list say the same). */
export const AI_ACTION_STATUS: Record<AiActionStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "Aguardando você", variant: "warning" },
  RUNNING: { label: "Executando", variant: "neutral" },
  DONE: { label: "Feita", variant: "success" },
  FAILED: { label: "Falhou", variant: "error" },
  CANCELLED: { label: "Cancelada", variant: "outline" },
  EXPIRED: { label: "Expirou", variant: "outline" },
};

/** The detail labels the server uses for the amount. */
export const AI_ACTION_AMOUNT_LABELS = ["Custo", "Valor"];

const ISO_DAY = /\b(\d{4})-(\d{2})-(\d{2})\b/g;

/** A detail as people read it: calendar days as dd/mm/aaaa. */
export function formatAiActionValue(value: unknown): string {
  if (typeof value === "string") return value.replace(ISO_DAY, "$3/$2/$1");
  if (typeof value === "number") return value.toLocaleString("pt-BR");
  return JSON.stringify(value);
}

/** The server's one-line summary, with dates as dd/mm/aaaa. */
export const aiActionSummary = (action: AiActionItem) => formatAiActionValue(action.summary);

/** [label, value] of the amount ("Custo"/"Valor"), when the proposal has one. */
export function aiActionAmount(action: AiActionItem): [string, string] | null {
  for (const label of AI_ACTION_AMOUNT_LABELS) {
    const value = action.details[label];
    if (value != null && value !== "") return [label, formatAiActionValue(value)];
  }
  return null;
}

/** Where it came from: the system's chat or an outside app through the MCP. */
export const aiActionChannel = (action: AiActionItem) =>
  action.channel === "mcp" ? `MCP${action.app ? ` · ${action.app}` : ""}` : "Chat do sistema";

/** The record the action created (absolute link from the server), if any. */
export function aiActionLink(action: AiActionItem): string | null {
  const link = (action.result as { link?: unknown } | null)?.link;
  return typeof link === "string" ? link : null;
}
