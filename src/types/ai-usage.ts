/** Tokens and cost of the AI over a period (USD, computed by the server). */
export type AiUsageTotals = {
  calls: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
};

/** One slice: by task (`key` = session type), model (`label` = provider) or person (`label` = name). */
export type AiUsageSlice = {
  key: string;
  label: string | null;
  calls: number;
  costUsd: number;
};

export type AiUsageSummary = {
  month: string;
  totals: AiUsageTotals;
  bySession: AiUsageSlice[];
  byModel: AiUsageSlice[];
  byUser: AiUsageSlice[];
  /** Last 6 months, oldest first. */
  months: { month: string; calls: number; costUsd: number }[];
};

/** One recorded AI call. */
export type AiUsageEntry = {
  id: string;
  createdAt: string;
  sessionType: string;
  originType: string;
  originId: string | null;
  userId: string;
  userName: string | null;
  provider: string;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
  requestId: string | null;
};

export type AiUsageFilters = { month: string; page: number; pageSize: number };
