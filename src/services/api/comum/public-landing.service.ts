import { http } from "@/services/http/client";
import type { PublicCatalogItem, PublicLanding, PublicPlan } from "@/types/landing";

/** What the public site reads: no login (the editor uses the same data). */
export const publicLandingService = {
  async landing() {
    const { data } = await http.get<PublicLanding>("/public/landing");
    return data;
  },
  async catalog() {
    const { data } = await http.get<{ items: PublicCatalogItem[] }>("/public/catalog");
    return data.items;
  },
  async plans() {
    const { data } = await http.get<{ items: PublicPlan[] }>("/public/plans");
    return data.items;
  },
};
