import { http } from "@/services/http/client";
import type { CustomerLoginInput, LoginResponse } from "@/types/auth";

/** Renter login: e-mail or CPF (the initial password is the CPF). */
export const customerAuthService = {
  async login(input: CustomerLoginInput) {
    const { data } = await http.post<LoginResponse>(
      "/auth/customer/login",
      input,
    );
    return data;
  },
};
