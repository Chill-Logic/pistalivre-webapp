import { toQueryParams } from "@/helpers/query-params";
import { http } from "@/services/http/client";
import type { StaffUser, StaffUserDetail, UserFilters } from "@/types/user";

/** Staff accounts, read-only (no password ever comes back). */
export const usersService = {
  async list(filters: UserFilters) {
    const { data } = await http.get<{ items: StaffUser[] }>("/users", {
      params: toQueryParams(filters),
    });
    return data.items;
  },
  async get(id: string) {
    const { data } = await http.get<StaffUserDetail>(`/users/${id}`);
    return data;
  },
};
