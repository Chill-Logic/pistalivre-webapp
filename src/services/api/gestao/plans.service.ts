import { http } from "@/services/http/client";
import type { Plan, PlanInput } from "@/types/plan";

export const plansService = {
  async list() {
    const { data } = await http.get<{ items: Plan[] }>("/plans");
    return data.items;
  },
  async get(id: string) {
    const { data } = await http.get<Plan>(`/plans/${id}`);
    return data;
  },
  async create(input: PlanInput) {
    const { data } = await http.post<Plan>("/plans", input);
    return data;
  },
  /** Replaces the whole plan (an omitted field becomes empty). */
  async update(id: string, input: PlanInput) {
    const { data } = await http.put<Plan>(`/plans/${id}`, input);
    return data;
  },
  /** A lead that chose it loses the reference — prefer deactivating. */
  async remove(id: string) {
    await http.delete(`/plans/${id}`);
  },
};
