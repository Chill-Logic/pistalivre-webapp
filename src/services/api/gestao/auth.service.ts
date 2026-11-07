import { http } from "@/services/http/client";
import type { LoginInput, LoginResponse } from "@/types/auth";

/** Staff login (the customer portal has its own, under cliente/). */
export const staffAuthService = {
  async login(input: LoginInput) {
    const { data } = await http.post<LoginResponse>("/auth/login", input);
    return data;
  },
};
