import { http } from "@/services/http/client";
import type { RentalCustomerView } from "@/types/portal";

/** "Ver como cliente": the rental exactly as the renter sees it (read-only). */
export const rentalCustomerViewService = {
  async get(rentalId: string) {
    const { data } = await http.get<RentalCustomerView>(
      `/rentals/${rentalId}/customer-view`,
    );
    return data;
  },
};
