import { http } from "@/services/http/client";
import type { LoginInput, LoginResponse, MeResponse } from "@/types/auth";

export const authService = {
  async login(input: LoginInput) {
    const { data } = await http.post<LoginResponse>("/auth/login", input);
    return data;
  },
  async me() {
    const { data } = await http.get<MeResponse>("/auth/me");
    return data.user;
  },
};
