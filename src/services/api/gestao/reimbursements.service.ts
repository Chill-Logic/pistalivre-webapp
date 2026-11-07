import { http } from "@/services/http/client";
import type {
  RejectReimbursementInput,
  StaffReimbursements,
} from "@/types/staff-reimbursement";

/**
 * Review queue. Rejecting is a record (the customer sees why and can ask
 * again); approving/paying never happens here — money does not leave
 * through the system (owner's call).
 */
export const reimbursementsService = {
  async list() {
    const { data } = await http.get<StaffReimbursements>("/reimbursements");
    return data;
  },
  async reject(id: string, input: RejectReimbursementInput) {
    await http.post(`/reimbursements/${id}/reject`, input);
  },
};
