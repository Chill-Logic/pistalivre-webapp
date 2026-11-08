import { http } from "@/services/http/client";
import type {
  RentStatement,
  RentStatementParams,
} from "@/types/rent-statement";

/**
 * The rental's rent statement (screen and PDF), the same model the
 * management prints. Staff reads `/rentals/:id/…`, the renter `/me/rentals/:id/…`.
 */
export type RentStatementScope = "staff" | "portal";

const base = (scope: RentStatementScope, rentalId: string) =>
  scope === "portal"
    ? `/me/rentals/${rentalId}/statement`
    : `/rentals/${rentalId}/statement`;

export const rentStatementService = {
  async get(
    scope: RentStatementScope,
    rentalId: string,
    params: RentStatementParams,
  ) {
    const { data } = await http.get<RentStatement>(base(scope, rentalId), {
      params,
    });
    return data;
  },
  async pdf(
    scope: RentStatementScope,
    rentalId: string,
    params: RentStatementParams,
  ) {
    const { data } = await http.get<Blob>(`${base(scope, rentalId)}/pdf`, {
      params,
      responseType: "blob",
    });
    return data;
  },
};
