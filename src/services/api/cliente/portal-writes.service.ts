import { http } from "@/services/http/client";
import type { ReimbursementRequestInput } from "@/types/portal";

/**
 * What the renter records: refund requests, maintenance paid out of pocket
 * and inspections. Files go as multipart; a maintenance or an inspection is
 * one event, so all its files go in the same request.
 */
export const portalWritesService = {
  async requestReimbursement(input: ReimbursementRequestInput) {
    const { data } = await http.post<{
      id: string;
      status: string;
      amount: number;
    }>("/me/reimbursements", input);
    return data;
  },
  /** One file per request, only while the request is pending. */
  async attachReimbursementReceipt(id: string, file: File) {
    const body = new FormData();
    body.append("file", file);
    await http.post(`/me/reimbursements/${id}/documents`, body);
  },
};
