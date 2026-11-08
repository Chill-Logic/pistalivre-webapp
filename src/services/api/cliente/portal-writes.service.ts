import { http } from "@/services/http/client";
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
  async inspectionRequirements(rentalId: string) {
    const { data } = await http.get<InspectionRequirements>(
      `/me/rentals/${rentalId}/inspections/requirements`,
    );
    return data;
  },
  /** One request: photos as `photo_<key>`, OK checks as `check_<key>`. */
  async sendInspection(rentalId: string, input: InspectionSubmitInput) {
    const body = new FormData();
    body.append("type", input.type);
    body.append("mileage", String(input.mileage));
    if (input.notes) body.append("notes", input.notes);
    if (input.type === "FULL") {
      for (const [key, file] of Object.entries(input.photos)) {
        body.append(`photo_${key}`, file);
      }
      for (const key of input.checksOk) body.append(`check_${key}`, "true");
    }
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
