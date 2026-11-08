import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { rentalCustomerViewService } from "@/services/api/gestao/rental-customer-view.service";

/** The renter's view of a rental, under the rental's key (refreshes with it). */
export function useRentalCustomerView(rentalId: string) {
  return useQuery({
    queryKey: [...queryKeys.rentals.detail(rentalId), "customer-view"],
    queryFn: () => rentalCustomerViewService.get(rentalId),
  });
}
