import { http } from "@/services/http/client";
import type {
  Company,
  CompanyInput,
  IntegrationConfig,
  IntegrationInput,
  IntegrationTestResult,
  InterWebhookRegistration,
} from "@/types/company";

/**
 * Company profile and the providers' config. Secrets never come back: a
 * secret field arrives blank with `isSet`, and a blank one sent keeps it.
 */
export const companyService = {
  async get() {
    const { data } = await http.get<Company>("/company");
    return data;
  },
  async update(input: CompanyInput) {
    const { data } = await http.put<Company>("/company", input);
    return data;
  },
  async integrations() {
    const { data } = await http.get<{ items: IntegrationConfig[] }>(
      "/company/integrations",
    );
    return data.items;
  },
  /** Admin only (403 for an agent). Answers the whole list again. */
  async saveIntegration(provider: string, input: IntegrationInput) {
    const { data } = await http.put<{ items: IntegrationConfig[] }>(
      `/company/integrations/${provider}`,
      input,
    );
    return data.items;
  },
  /** Live round-trip with the stored credentials (clicksign and inter). */
  async testIntegration(provider: string) {
    const { data } = await http.post<IntegrationTestResult>(
      `/company/integrations/${provider}/test`,
    );
    return data;
  },
  /** The callback registered at the Inter right now. */
  async interWebhook() {
    const { data } = await http.get<{ url: string | null }>(
      "/company/integrations/inter/webhook",
    );
    return data.url;
  },
  /** Registers OUR callbacks at the Inter (inbound notifications only). */
  async registerInterWebhook(url: string) {
    const { data } = await http.post<InterWebhookRegistration>(
      "/company/integrations/inter/webhook",
      { url },
    );
    return data;
  },
};
