import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  CampaignLink,
  CampaignLinkInput,
  CrmOptions,
  LeadActivity,
  LeadActivityInput,
  LeadDetail,
  LeadInput,
  LeadFilters,
  LeadFunnel,
  LeadListItem,
  LeadStatus,
} from "@/types/crm";

/**
 * CRM. Every write answers with the lead's detail (except the activity and
 * delete). LOST/WON are terminal: the API refuses to move or lose them again,
 * and reopening creates a COPY (the original stays as history).
 */
export const crmService = {
  async funnel() {
    const { data } = await http.get<LeadFunnel>("/crm/funnel");
    return data;
  },
  async leads(filters: LeadFilters) {
    const { data } = await http.get<Paginated<LeadListItem>>("/crm/leads", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async lead(id: string) {
    const { data } = await http.get<LeadDetail>(`/crm/leads/${id}`);
    return data;
  },
  async options() {
    const { data } = await http.get<CrmOptions>("/crm/options");
    return data;
  },
  async createLead(input: LeadInput) {
    const { data } = await http.post<LeadDetail>("/crm/leads", input);
    return data;
  },
  async updateNotes(id: string, notes: string) {
    const { data } = await http.patch<LeadDetail>(`/crm/leads/${id}`, {
      notes,
    });
    return data;
  },
  async removeLead(id: string) {
    await http.delete(`/crm/leads/${id}`);
  },
  async changeStatus(id: string, status: LeadStatus) {
    const { data } = await http.patch<LeadDetail>(`/crm/leads/${id}/status`, {
      status,
    });
    return data;
  },
  async markLost(id: string, reasons: string[], note: string | null) {
    const { data } = await http.post<LeadDetail>(`/crm/leads/${id}/lost`, {
      reasons,
      note,
    });
    return data;
  },
  /** Answers with the NEW lead (the copy), not the reopened one. */
  async reopen(id: string, reason: string) {
    const { data } = await http.post<LeadDetail>(`/crm/leads/${id}/reopen`, {
      reason,
    });
    return data;
  },
  async addActivity(id: string, input: LeadActivityInput) {
    const { data } = await http.post<LeadActivity>(
      `/crm/leads/${id}/activities`,
      input,
    );
    return data;
  },
  /** One file per request, like the gestão's batch upload. */
  async attachToActivity(activityId: string, file: File) {
    const body = new FormData();
    body.append("ownerType", "LEAD_ACTIVITY");
    body.append("ownerId", activityId);
    body.append("file", file);
    // Uploads take longer than the default timeout on a slow connection.
    await http.post("/documents", body, { timeout: 120_000 });
  },
  async campaignLinks() {
    const { data } = await http.get<{ items: CampaignLink[] }>(
      "/crm/campaign-links",
    );
    return data.items;
  },
  async createCampaignLink(input: CampaignLinkInput) {
    const { data } = await http.post<CampaignLink>(
      "/crm/campaign-links",
      input,
    );
    return data;
  },
  async removeCampaignLink(id: string) {
    await http.delete(`/crm/campaign-links/${id}`);
  },
  /** "Simular lead": a sandbox lead through the link. */
  async createTestLead(linkId: string) {
    const { data } = await http.post<{ leadId: string }>(
      `/crm/campaign-links/${linkId}/test-lead`,
    );
    return data;
  },
  /** How many sandbox leads exist (a one-item page, just for the total). */
  async testLeadCount() {
    const { data } = await http.get<Paginated<LeadListItem>>("/crm/leads", {
      params: { test: "test", page: 1, pageSize: 1 },
    });
    return data.total;
  },
  /** Deletes EVERY test lead (and its attachments). */
  async removeTestLeads() {
    const { data } = await http.delete<{ deleted: number }>("/crm/leads", {
      params: { test: true },
    });
    return data;
  },
  /** Creates the public questionnaire link, or reuses the open one. */
  async questionnaire(id: string) {
    const { data } = await http.post<LeadDetail>(
      `/crm/leads/${id}/questionnaire`,
    );
    return data;
  },
};
