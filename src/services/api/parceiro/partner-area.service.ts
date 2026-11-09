import { http } from "@/services/http/client";
import type {
  PartnerAreaHome,
  PartnerAreaPasswordInput,
  PartnerAreaProfileInput,
  PartnerAreaRentalDetail,
  PartnerAreaVehicleDetail,
} from "@/types/partner-area";

/**
 * The partner's own area (partner Bearer). What may be read is decided on
 * the server: another vehicle, or a rental outside the window, is a 404.
 */
export const partnerAreaService = {
  async home() {
    const { data } = await http.get<PartnerAreaHome>("/partner");
    return data;
  },
  async vehicle(id: string) {
    const { data } = await http.get<PartnerAreaVehicleDetail>(
      `/partner/vehicles/${encodeURIComponent(id)}`,
    );
    return data;
  },
  async rental(id: string) {
    const { data } = await http.get<PartnerAreaRentalDetail>(
      `/partner/rentals/${encodeURIComponent(id)}`,
    );
    return data;
  },
  /** The contract's PDF (404 when there is none, or not the partner's). */
  async contractDocument(id: string) {
    const { data } = await http.get<Blob>(
      `/partner/contracts/${encodeURIComponent(id)}/document`,
      { responseType: "blob" },
    );
    return data;
  },
  /** The PDF of a proposal's version (the text the partner decides on). */
  async proposalDocument(contractId: string, versionId: string) {
    const { data } = await http.get<Blob>(
      `/partner/contracts/${encodeURIComponent(contractId)}/proposals/${encodeURIComponent(versionId)}/document`,
      { responseType: "blob" },
    );
    return data;
  },
  /**
   * Accepts the pending version (date, IP and browser are recorded). 422 when
   * it was already decided or the company changed it since.
   */
  async acceptProposal(contractId: string, versionId: string) {
    await http.post(
      `/partner/contracts/${encodeURIComponent(contractId)}/proposals/${encodeURIComponent(versionId)}/accept`,
    );
  },
  /** Refuses the pending version; the reason is required. */
  async rejectProposal(contractId: string, versionId: string, note: string) {
    await http.post(
      `/partner/contracts/${encodeURIComponent(contractId)}/proposals/${encodeURIComponent(versionId)}/reject`,
      { note },
    );
  },
  /** Only the phone and the pix key are the partner's to change. */
  async updateProfile(input: PartnerAreaProfileInput) {
    const { data } = await http.patch<{
      phone: string | null;
      pixKey: string | null;
    }>("/partner/profile", input);
    return data;
  },
  /** 204; every session of the partner ends (log in again). */
  async changePassword(input: PartnerAreaPasswordInput) {
    await http.put("/partner/password", input);
  },
};
