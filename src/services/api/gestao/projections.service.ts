import { http } from "@/services/http/client";
import type {
  ProjectionComputed,
  ProjectionSeed,
  ProjectionState,
} from "@/types/projection";

/**
 * Operation projection. The math lives in the API (core/projections): the
 * SPA sends the edited scenario and shows what comes back.
 */
export const projectionsService = {
  /** The real fleet as a scenario, or the one in a shared `?sim=` link. */
  async seed(sim: string) {
    const { data } = await http.get<ProjectionSeed>("/projections/seed", {
      params: sim ? { sim } : undefined,
    });
    return data;
  },
  async compute(state: ProjectionState) {
    const { data } = await http.post<ProjectionComputed>(
      "/projections/compute",
      { state },
    );
    return data;
  },
  /** The accountant's PDF for a scenario. */
  async report(sim: string) {
    const { data } = await http.get<Blob>("/projections/report", {
      params: { sim },
      responseType: "blob",
      timeout: 120_000,
    });
    return data;
  },
};
