import { http } from "@/services/http/client";
import type { MeResponse, PwaUsage } from "@/types/auth";

/** Who owns the current token (staff or customer — same endpoint). */
export const sessionService = {
  async me() {
    const { data } = await http.get<MeResponse>("/auth/me");
    return data.user;
  },
  /** "Agora não" on the install invite (comes back in 7 days). */
  async dismissPwaInvite() {
    const { data } = await http.post<PwaUsage>("/auth/me/pwa-invite/dismiss");
    return data;
  },
  /** "Instalar" on the install invite: never offered again. */
  async markPwaInstalled() {
    const { data } = await http.post<PwaUsage>("/auth/me/pwa-invite/install");
    return data;
  },
};
