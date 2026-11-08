import { http } from "@/services/http/client";
import type {
  MarkReimbursementPaidInput,
  RejectReimbursementInput,
  StaffReimbursements,
} from "@/types/staff-reimbursement";

/**
 * Review queue. Rejecting and "paid outside" are records: the pix is sent
 * by hand in Asaas/the bank — money never leaves through the system
 * (owner's call), so there is no approve/pay.
 */
export const reimbursementsService = {
  async list() {
    const { data } = await http.get<StaffReimbursements>("/reimbursements");
    return data;
  },
  async reject(id: string, input: RejectReimbursementInput) {
    await http.post(`/reimbursements/${id}/reject`, input);
  },
  async markPaid(id: string, input: MarkReimbursementPaidInput) {
    await http.post(`/reimbursements/${id}/paid`, input);
  },
};
