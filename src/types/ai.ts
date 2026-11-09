/** An AI tool as the screens list it. */
export type AiToolBrief = { name: string; title: string; kind: "read" | "draft" };

export type AiTool = AiToolBrief & {
  description: string;
  channels: ("chat" | "mcp")[];
};

/** An app's authorization by one person (OAuth grant). */
export type AiGrant = {
  id: string;
  clientId: string;
  clientName: string;
  clientBlocked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

/** GET /ai/me — what this person may use and the apps they authorized. */
export type AiMe = {
  mcpUrl: string;
  aiEnabled: boolean;
  chatTools: AiToolBrief[];
  mcpTools: AiToolBrief[];
  grants: AiGrant[];
};

export type AiChatMode = "contract" | "proposal";

export type AiChatMessage = { role: "user" | "assistant"; content: string };

export type AiChatStep = { tool: string; title: string; ok: boolean };

export type AiChatInput = {
  mode: AiChatMode;
  html: string;
  history: AiChatMessage[];
  message: string;
  rentalId?: string;
  leadId?: string;
};

export type AiChatResponse = {
  reply: string;
  html: string;
  changed: boolean;
  steps: AiChatStep[];
  stopReason: "ok" | "refusal" | "max_tokens" | "max_steps";
};

/** GET /oauth/consent — the consent screen. */
export type AiConsent = {
  client: { id: string; name: string; redirectHost: string };
  tools: AiToolBrief[];
};

/** GET /ai/permissions (admin). */
export type AiPermissions = {
  tools: AiTool[];
  roles: Record<string, string[]>;
  users: { id: string; name: string; role: string; allow: string[]; deny: string[]; effective: string[] }[];
};

/** GET /ai/clients (admin): an app and who authorized it. */
export type AiClient = {
  id: string;
  name: string;
  redirectUris: string[];
  blocked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  grants: (AiGrant & { userId: string; userName: string | null })[];
};

export type AiAuditChannel = "chat" | "mcp" | "oauth" | "admin";

/** One audited event, input and output in full. */
export type AiAuditEntry = {
  id: string;
  createdAt: string;
  channel: AiAuditChannel;
  method: string;
  tool: string | null;
  userId: string | null;
  userName: string | null;
  clientId: string | null;
  clientName: string | null;
  grantId: string | null;
  ip: string | null;
  userAgent: string | null;
  input: unknown;
  output: unknown;
  ok: boolean;
  error: string | null;
  durationMs: number;
};

export type AiAuditFilters = {
  page: number;
  pageSize: number;
  channel: string;
  userId: string;
  clientId: string;
  tool: string;
  ok: string;
  de: string;
  ate: string;
};
