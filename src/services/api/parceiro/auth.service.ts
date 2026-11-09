import { http } from "@/services/http/client";
import type { LoginInput, LoginResponse } from "@/types/auth";

/** Partner login (app.parceiro): the access the staff gave. */
export const partnerAuthService = {
  async login(input: LoginInput) {
    const { data } = await http.post<LoginResponse>(
      "/auth/partner/login",
      input,
    );
    return data;
  },
};
