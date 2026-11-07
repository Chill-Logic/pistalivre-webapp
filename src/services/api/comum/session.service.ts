import { http } from "@/services/http/client";
import type { MeResponse } from "@/types/auth";

/** Who owns the current token (staff or customer — same endpoint). */
export const sessionService = {
  async me() {
    const { data } = await http.get<MeResponse>("/auth/me");
    return data.user;
  },
};
