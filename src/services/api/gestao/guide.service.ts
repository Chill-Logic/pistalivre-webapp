import { http } from "@/services/http/client";
import type { GuideResponse } from "@/types/guide";

export const guideService = {
  /** The whole manual (small: a few dozen sections). */
  async get() {
    const { data } = await http.get<GuideResponse>("/guide");
    return data;
  },
};
