import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type { AiUsageEntry } from "@/types/ai-usage";
import { formatInteger } from "@/utils/format";

type Label = (map: LabelMapName, code: string) => string;

/** "Personalizar contrato · Locação". */
export function aiUsageTask(entry: AiUsageEntry, label: Label) {
  return `${label(LABEL_MAPS.aiSessionType, entry.sessionType)} · ${label(LABEL_MAPS.aiUsageOrigin, entry.originType)}`;
}

/** "claude-opus-5-5 · Anthropic". */
export function aiUsageModel(entry: AiUsageEntry, label: Label) {
  return `${entry.model ?? "—"} · ${label(LABEL_MAPS.aiProvider, entry.provider)}`;
}

/** "9.000 entrada · 7.000 saída · 2.000 cache". */
export function aiUsageTokens(entry: AiUsageEntry) {
  const cache = entry.cacheReadTokens + entry.cacheCreationTokens;
  return [
    `${formatInteger(entry.inputTokens)} entrada`,
    `${formatInteger(entry.outputTokens)} saída`,
    cache > 0 && `${formatInteger(cache)} cache`,
  ]
    .filter(Boolean)
    .join(" · ");
}
