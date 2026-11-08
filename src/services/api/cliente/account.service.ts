import { http } from "@/services/http/client";

/** The renter's own account (customer Bearer). */
export const accountService = {
  /**
   * Revokes every token issued before it: the API answers with a fresh one,
   * which replaces the stored token (or the next request would 401).
   */
  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }) {
    const { data } = await http.put<{ token: string }>("/me/password", input);
    return data.token;
  },
};
