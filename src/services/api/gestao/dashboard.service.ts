import { http } from "@/services/http/client";
import type { Dashboard } from "@/types/dashboard";

export const dashboardService = {
  async get() {
    const { data } = await http.get<Dashboard>("/dashboard");
    return data;
  },
};
