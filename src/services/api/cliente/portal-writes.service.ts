import { appendInspectionFields } from "@/helpers/inspection";
import { http } from "@/services/http/client";
import type { DocumentFile } from "@/types/document";
import type {
  InspectionRequirements,
  InspectionSubmitInput,
  MaintenanceReportInput,
  ReimbursementRequestInput,
} from "@/types/portal";

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
  /** Description, cost, date and the receipts (≥ 1) in one request. */
  async reportMaintenance(rentalId: string, input: MaintenanceReportInput) {
    const body = new FormData();
    body.append("description", input.description);
    body.append("cost", String(input.cost));
    if (input.performedAt) body.append("performedAt", input.performedAt);
    for (const file of input.files) body.append("files", file);
    const { data } = await http.post<{ id: string }>(
      `/me/rentals/${rentalId}/maintenances`,
      body,
    );
    return data;
  },
  /**
   * One more file on a maintenance the renter registered (e.g. the receipt
   * a refused refund missed). One file per request; the kind is required.
   */
  async attachMaintenanceDocument(
    rentalId: string,
    maintenanceId: string,
    file: File,
    categoryId: string,
  ) {
    const body = new FormData();
    body.append("categoryId", categoryId);
    body.append("file", file);
    const { data } = await http.post<DocumentFile>(
      `/me/rentals/${rentalId}/maintenances/${maintenanceId}/documents`,
      body,
    );
    return data;
  },
  async inspectionRequirements(rentalId: string) {
    const { data } = await http.get<InspectionRequirements>(
      `/me/rentals/${rentalId}/inspections/requirements`,
    );
    return data;
  },
  /** One request: photos as `photo_<key>`, OK checks as `check_<key>`. */
  async sendInspection(rentalId: string, input: InspectionSubmitInput) {
    const body = appendInspectionFields(new FormData(), input);
    const { data } = await http.post<{ id: string }>(
      `/me/rentals/${rentalId}/inspections`,
      body,
    );
    return data;
  },
  /** Only one the renter made on this rental. */
  async deleteInspection(rentalId: string, inspectionId: string) {
    await http.delete(`/me/rentals/${rentalId}/inspections/${inspectionId}`);
  },
};
