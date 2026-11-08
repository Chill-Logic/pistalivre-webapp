import { http } from "@/services/http/client";
import type {
  CustomerInvoices,
  Invoice,
  RentalInvoiceInput,
  RentalInvoices,
  StandaloneInvoiceInput,
} from "@/types/invoice";

const idempotent = (key: string) => ({
  headers: { "Idempotency-Key": key },
});

/** NFS-e at Asaas: list, issue (rental or loose), cancel and link. */
export const invoicesService = {
  async forRental(rentalId: string) {
    const { data } = await http.get<RentalInvoices>(
      `/rentals/${rentalId}/invoices`,
    );
    return data;
  },
  async forCustomer(customerId: string) {
    const { data } = await http.get<CustomerInvoices>(
      `/customers/${customerId}/invoices`,
    );
    return data;
  },
  async createForRental(
    rentalId: string,
    input: RentalInvoiceInput,
    key: string,
  ) {
    const { data } = await http.post<Invoice>(
      `/rentals/${rentalId}/invoices`,
      input,
      idempotent(key),
    );
    return data;
  },
  async createStandalone(input: StandaloneInvoiceInput, key: string) {
    const { data } = await http.post<Invoice>(
      "/invoices",
      input,
      idempotent(key),
    );
    return data;
  },
  /** Cancels at Asaas (outside the city's window → 502 with its reason). */
  async cancel(id: string) {
    await http.delete(`/invoices/${id}`);
  },
  async link(id: string, rentalId: string) {
    await http.post(`/invoices/${id}/link`, { rentalId });
  },
};
