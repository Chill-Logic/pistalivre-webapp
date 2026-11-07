import { http } from "@/services/http/client";
import type { StaffReimbursements } from "@/types/staff-reimbursement";

/** Read-only: approving sends a pix, rejecting is a write — owner's call. */
export const reimbursementsService = {
  async list() {
    const { data } = await http.get<StaffReimbursements>("/reimbursements");
    return data;
  },
};
