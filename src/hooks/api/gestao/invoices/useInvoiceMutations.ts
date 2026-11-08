import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { invoicesService } from "@/services/api/gestao/invoices.service";
import type {
  RentalInvoiceInput,
  StandaloneInvoiceInput,
} from "@/types/invoice";

/** NFs show on the rental and on the customer: refresh both lists. */
function useRefreshInvoices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.rentals.all, "invoices"],
    });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.customers.all, "invoices"],
    });
  };
}

export function useCreateRentalInvoice(rentalId: string) {
  const refresh = useRefreshInvoices();
  return useMutation({
    mutationFn: ({ input, key }: { input: RentalInvoiceInput; key: string }) =>
      invoicesService.createForRental(rentalId, input, key),
    onSuccess: () => {
      refresh();
      toast.success("Nota fiscal agendada no Asaas");
    },
  });
}

export function useCreateStandaloneInvoice() {
  const refresh = useRefreshInvoices();
  return useMutation({
    mutationFn: ({
      input,
      key,
    }: {
      input: StandaloneInvoiceInput;
      key: string;
    }) => invoicesService.createStandalone(input, key),
    onSuccess: () => {
      refresh();
      toast.success("Nota fiscal agendada no Asaas");
    },
  });
}

export function useCancelInvoice() {
  const refresh = useRefreshInvoices();
  return useMutation({
    mutationFn: (id: string) => invoicesService.cancel(id),
    onSuccess: () => {
      refresh();
      toast.success("Cancelamento pedido ao Asaas");
    },
  });
}

export function useLinkInvoice() {
  const refresh = useRefreshInvoices();
  return useMutation({
    mutationFn: ({ id, rentalId }: { id: string; rentalId: string }) =>
      invoicesService.link(id, rentalId),
    onSuccess: () => {
      refresh();
      toast.success("Nota vinculada à locação");
    },
  });
}
