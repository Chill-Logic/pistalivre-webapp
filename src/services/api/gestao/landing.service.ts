import type { Data } from "@puckeditor/core";
import { http } from "@/services/http/client";
import type { LandingPageState, LandingVersion } from "@/types/landing";

/** The site (pistalivrelocacoes.com.br): draft, publishing and versions. */
export const landingService = {
  async get() {
    const { data } = await http.get<LandingPageState>("/landing");
    return data;
  },
  async saveDraft(page: Data) {
    const { data } = await http.put<LandingPageState>("/landing/draft", { data: page });
    return data;
  },
  async publish() {
    const { data } = await http.post<LandingPageState>("/landing/publish");
    return data;
  },
  async versions() {
    const { data } = await http.get<{ items: LandingVersion[] }>("/landing/versions");
    return data.items;
  },
  async restore(versionId: string) {
    const { data } = await http.post<LandingPageState>(`/landing/versions/${versionId}/restore`);
    return data;
  },
};
