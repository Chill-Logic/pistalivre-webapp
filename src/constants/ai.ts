import type { AiToolKind } from "@/types/ai";

/** How each kind of AI tool reads on the screens. */
export const AI_TOOL_KIND_LABELS: Record<AiToolKind, string> = {
  read: "Leitura",
  draft: "Rascunho",
  write: "Escrita",
};
