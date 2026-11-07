import { http } from "@/services/http/client";
import type {
  PortalCharge,
  PortalInvoice,
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
  async reimbursements() {
    const { data } = await http.get<Items<Reimbursement>>("/me/reimbursements");
    return data.items;
  },
};
