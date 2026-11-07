import { http } from "@/services/http/client";
import type { Plan } from "@/types/plan";

export const plansService = {
  async list() {
    const { data } = await http.get<{ items: Plan[] }>("/plans");
    return data.items;
  },
};
