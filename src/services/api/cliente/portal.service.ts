import { http } from "@/services/http/client";
import type { DocumentCategory } from "@/types/document";
import type {
  PortalAttachOwner,
  PortalCharge,
  PortalInvoice,
  PortalProfile,
  PortalRental,
  PortalRentalSections,
  Reimbursement,
  WalletKey,
} from "@/types/portal";

type Items<T> = { items: T[] };

/** The renter's own data (`/me/*`, customer Bearer). Read-only. */
export const portalService = {
  async rentals() {
    const { data } = await http.get<Items<PortalRental>>("/me/rentals");
    return data.items;
  },
  async rental(id: string) {
    const { data } = await http.get<PortalRental>(`/me/rentals/${id}`);
    return data;
  },
  async rentalSections(id: string) {
    const { data } = await http.get<PortalRentalSections>(
      `/me/rentals/${id}/sections`,
    );
    return data;
  },
  async profile() {
    const { data } = await http.get<PortalProfile>("/me/profile");
    return data;
  },
  async charges() {
    const { data } = await http.get<Items<PortalCharge>>("/me/charges");
    return data.items;
  },
  async invoices() {
    const { data } = await http.get<Items<PortalInvoice>>("/me/invoices");
    return data.items;
  },
  async wallet() {
    const { data } = await http.get<Items<WalletKey>>("/me/wallet");
    return data.items;
  },
  /** Kinds the renter can pick when attaching (maintenance, refund). */
  async documentCategories(ownerType: PortalAttachOwner) {
    const { data } = await http.get<Items<DocumentCategory>>(
      "/me/document-categories",
      { params: { ownerType } },
    );
    return data.items;
  },
  async reimbursements() {
    const { data } = await http.get<Items<Reimbursement>>("/me/reimbursements");
    return data.items;
  },
};
