import type { ContractDraftState } from "@/types/contract";

/** An AI tool as the screens list it. */
/** read = looks at data; draft = edits the open document; write = changes data after the person confirms. */
export type AiToolKind = "read" | "draft" | "write";

export type AiToolBrief = { name: string; title: string; kind: AiToolKind };

export type AiTool = AiToolBrief & {
  description: string;
  channels: ("chat" | "mcp")[];
  /** Off until the admin turns it on (sensitive reads and every write). */
  defaultOff: boolean;
  /** "Financeiro", "Comercial e painel"… (groups the admin screen). */
  area: string;
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

/** `general` = the assistant on any screen (no document open). */
export type AiChatMode =
  "contract" | "proposal" | "partner_contract" | "general";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Files sent with that message: the model sees them again. */
  attachmentIds?: string[];
};

/** A file sent to the AI chat (POST /ai/attachments). */
export type AiAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
};

export type AiChatStep = { tool: string; title: string; ok: boolean };

export type AiChatInput = {
  mode: AiChatMode;
  html: string;
  history: AiChatMessage[];
  message: string;
  rentalId?: string;
  leadId?: string;
  /** mode "partner_contract": the partner contract whose PDF is being made. */
  partnerContractId?: string;
  /** A rental contract saved on the server: the chat saves its changes there. */
  draftId?: string;
  /** The draft version the editor shows (409 if it changed since). */
  version?: number;
  /** Files sent with this message (uploaded first). */
  attachmentIds?: string[];
  /** The screen the person is on (mode "general"). */
  page?: string;
};

/** A write the agent proposed: nothing happens until the person confirms. */
export type AiChatAction = {
  id: string;
  tool: string;
  title: string;
  summary: string;
  /** Label → value, labels ready from the server. */
  details: Record<string, unknown>;
  expiresAt: string;
};

export type AiChatResponse = {
  reply: string;
  html: string;
  changed: boolean;
  steps: AiChatStep[];
  actions: AiChatAction[];
  stopReason: "ok" | "refusal" | "max_tokens" | "max_steps";
  /** With `draftId`: the saved draft after this answer (new version). */
  draft?: ContractDraftState | null;
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
  users: {
    id: string;
    name: string;
    role: string;
    allow: string[];
    deny: string[];
    effective: string[];
  }[];
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

/** GET /ai/audit/gaps (admin): what went unanswered. */
export type AiGaps = {
  questions: {
    total: number;
    byReason: { reason: string; count: number }[];
  };
  denied: { tool: string; count: number; people: string[]; lastAt: string }[];
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
