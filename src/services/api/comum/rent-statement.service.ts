import { http } from "@/services/http/client";
import type {
  RentStatement,
  RentStatementParams,
} from "@/types/rent-statement";

/**
 * The rental's rent statement (screen and PDF), the same model the
 * management prints. Staff reads `/rentals/:id/…`, the renter `/me/rentals/:id/…`,
 * the partner `/partner/rentals/:id/…` (cut to their window by the server,
 * without the customer's debts).
 */
export type RentStatementScope = "staff" | "portal" | "partner";

const BASE: Record<RentStatementScope, string> = {
  staff: "/rentals",
  portal: "/me/rentals",
  partner: "/partner/rentals",
};

const base = (scope: RentStatementScope, rentalId: string) =>
  `${BASE[scope]}/${rentalId}/statement`;

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
