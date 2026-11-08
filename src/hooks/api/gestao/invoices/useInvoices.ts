import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { invoicesService } from "@/services/api/gestao/invoices.service";

/** Keys under the rental/customer `all`, so their invalidation covers NFs. */
export const invoiceKeys = {
  rental: (id: string) => [...queryKeys.rentals.all, "invoices", id] as const,
  customer: (id: string) =>
    [...queryKeys.customers.all, "invoices", id] as const,
};

/** NFs of the rental + what "Emitir NF" pre-fills. */
export function useRentalInvoices(rentalId: string) {
  return useQuery({
    queryKey: invoiceKeys.rental(rentalId),
    queryFn: () => invoicesService.forRental(rentalId),
  });
}

/** Every NF of the customer (loose ones can be linked to a rental). */
export function useCustomerInvoices(customerId: string) {
  return useQuery({
    queryKey: invoiceKeys.customer(customerId),
    queryFn: () => invoicesService.forCustomer(customerId),
  });
}
