import { http } from "@/services/http/client";
import type {
  ApproveReimbursementResult,
  MarkReimbursementPaidInput,
  ReimbursementApprovalLink,
  ReimbursementMaintenanceCandidates,
  RejectReimbursementInput,
  StaffReimbursements,
} from "@/types/staff-reimbursement";

/**
 * Review queue: approve (saying which maintenance it pays), reject, and
 * "paid outside". All are records: the pix is sent by hand in Asaas/the
 * bank — money never leaves through the system (owner's call).
 */
export const reimbursementsService = {
  async list() {
    const { data } = await http.get<StaffReimbursements>("/reimbursements");
    return data;
  },
  async maintenanceCandidates(id: string) {
    const { data } = await http.get<ReimbursementMaintenanceCandidates>(
      `/reimbursements/${id}/maintenance-candidates`,
    );
    return data;
  },
  async approve(id: string, link: ReimbursementApprovalLink) {
    const { data } = await http.post<ApproveReimbursementResult>(
      `/reimbursements/${id}/approve`,
      { link },
    );
    return data;
  },
  async reject(id: string, input: RejectReimbursementInput) {
    await http.post(`/reimbursements/${id}/reject`, input);
  },
  async markPaid(id: string, input: MarkReimbursementPaidInput) {
    await http.post(`/reimbursements/${id}/paid`, input);
  },
};
