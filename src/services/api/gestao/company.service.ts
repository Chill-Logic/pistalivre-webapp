import { http } from "@/services/http/client";
import type { Company } from "@/types/company";

/** Company profile; integrations come as flags only, never their config. */
export const companyService = {
  async get() {
    const { data } = await http.get<Company>("/company");
    return data;
  },
};
