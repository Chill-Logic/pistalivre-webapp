import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { Paginated } from "@/types/api";
import type {
  StaffUser,
  StaffUserDetail,
  UserFilters,
  UserInput,
  UserPasswordInput,
} from "@/types/user";

/**
 * Staff accounts (no password ever comes back). The server enforces who may
 * do what (403); the UI only mirrors it.
 */
export const usersService = {
  async list(filters: UserFilters) {
    const { data } = await http.get<Paginated<StaffUser>>("/users", {
      params: toQueryParams(filters),
    });
    return data;
  },
  async get(id: string) {
    const { data } = await http.get<StaffUserDetail>(`/users/${id}`);
    return data;
  },
  async create(input: UserInput) {
    const { data } = await http.post<StaffUserDetail>("/users", input);
    return data;
  },
  async update(id: string, input: UserInput) {
    const { data } = await http.put<StaffUserDetail>(`/users/${id}`, input);
    return data;
  },
  /**
   * Changing a password revokes the tokens issued before it. On your OWN
   * password the API answers 200 with a fresh token (to keep this session);
   * an ADMIN changing someone else's gets 204 (no body).
   */
  async changePassword(id: string, input: UserPasswordInput) {
    const { data } = await http.put<{ token: string } | "">(
      `/users/${id}/password`,
      input,
    );
    return data && typeof data === "object" ? data.token : null;
  },
  async remove(id: string) {
    await http.delete(`/users/${id}`);
  },
};
