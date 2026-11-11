import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  AiAuditEntry,
  AiAuditFilters,
  AiChatInput,
  AiChatResponse,
  AiClient,
  AiConsent,
  AiGaps,
  AiMe,
  AiPermissions,
  AiAttachment,
} from "@/types/ai";

/**
 * The system's AI: the editor's chat, the person's integrations (MCP) and —
 * admin only — permissions, connected apps and the full audit.
 */
export const aiService = {
  async me() {
    const { data } = await http.get<AiMe>("/ai/me");
    return data;
  },
  /** A file for the chat (image or PDF): checked by its bytes on the server. */
  async uploadAttachment(file: File, onProgress?: (fraction: number) => void) {
    const body = new FormData();
    body.append("file", file);
    const { data } = await http.post<AiAttachment>("/ai/attachments", body, {
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(event.loaded / event.total);
      },
    });
    return data;
  },
  /** What this person sent to the AI in the last days, still unfiled. */
  async recentAttachments() {
    const { data } = await http.get<{ items: AiAttachment[] }>(
      "/ai/attachments",
    );
    return data.items;
  },
  async chat(input: AiChatInput) {
    const { data } = await http.post<AiChatResponse>("/ai/chat", input);
    return data;
  },
  /** Runs a write the chat proposed ("Confirmar"). */
  async confirmAction(id: string) {
    const { data } = await http.post<{
      id: string;
      summary: string;
      result: unknown;
    }>(`/ai/actions/${id}/confirm`);
    return data;
  },
  async cancelAction(id: string) {
    await http.post(`/ai/actions/${id}/cancel`);
  },
  async revokeGrant(id: string) {
    await http.delete(`/ai/grants/${id}`);
  },
  /** `query` = the /authorize query string, as it came. */
  async consent(query: string) {
    const { data } = await http.get<AiConsent>(`/oauth/consent?${query}`);
    return data;
  },
  async decide(params: Record<string, string>, decision: "approve" | "deny") {
    const { data } = await http.post<{ redirectTo: string }>("/oauth/consent", {
      ...params,
      decision,
    });
    return data.redirectTo;
  },
  async permissions() {
    const { data } = await http.get<AiPermissions>("/ai/permissions");
    return data;
  },
  async setRoleTools(role: string, tools: string[]) {
    const { data } = await http.put<AiPermissions>(
      `/ai/permissions/roles/${role}`,
      { tools },
    );
    return data;
  },
  async setUserOverrides(
    userId: string,
    overrides: { allow: string[]; deny: string[] },
  ) {
    const { data } = await http.put<AiPermissions>(
      `/ai/permissions/users/${userId}`,
      overrides,
    );
    return data;
  },
  async clients() {
    const { data } = await http.get<{ items: AiClient[] }>("/ai/clients");
    return data.items;
  },
  async setClientBlocked(id: string, blocked: boolean) {
    const { data } = await http.patch<{ items: AiClient[] }>(
      `/ai/clients/${id}`,
      { blocked },
    );
    return data.items;
  },
  async audit(filters: AiAuditFilters) {
    const { data } = await http.get<Paginated<AiAuditEntry>>("/ai/audit", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async gaps(period: { de: string; ate: string }) {
    const { data } = await http.get<AiGaps>("/ai/audit/gaps", {
      params: toQueryParams(period),
    });
    return data;
  },
  async auditEntry(id: string) {
    const { data } = await http.get<AiAuditEntry>(`/ai/audit/${id}`);
    return data;
  },
};
