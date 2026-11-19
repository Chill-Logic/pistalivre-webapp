import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { customerDebtsService } from "@/services/api/gestao/customer-debts.service";
import type {
  CustomerDebtInput,
  CustomerDebtPaymentInput,
  CustomerDebtsView,
  TransferRentBalanceInput,
} from "@/types/customer-debt";

/** Lives under the customer's keys, so customer invalidation reaches it. */
export const customerDebtsKey = (customerId: string) =>
  [...queryKeys.customers.all, "debts", customerId] as const;

export function useCustomerDebts(customerId: string) {
  return useQuery({
    queryKey: customerDebtsKey(customerId),
    queryFn: () => customerDebtsService.view(customerId),
  });
}

/** Every write answers the whole view: it replaces the cache (no refetch). */
function useCustomerDebtWrite<T>(
  customerId: string,
  write: (variables: T) => Promise<CustomerDebtsView>,
  message: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: write,
    onSuccess: (view) => {
      queryClient.setQueryData(customerDebtsKey(customerId), view);
      toast.success(message);
    },
  });
}

export function useSaveCustomerDebt(customerId: string, id?: string) {
  return useCustomerDebtWrite(
    customerId,
    (input: CustomerDebtInput) =>
      id
        ? customerDebtsService.update(id, input)
        : customerDebtsService.create(customerId, input),
    id ? "Débito atualizado" : "Débito registrado",
  );
}

export function useDeleteCustomerDebt(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerDebtsService.remove(id),
    onSuccess: (view) => {
      queryClient.setQueryData(customerDebtsKey(customerId), view);
      // A transferred debt gives the balance back to its rental.
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      toast.success("Débito excluído");
    },
  });
}

/** Ended rental's open rent → customer debt; the rental's screens refresh too. */
export function useTransferRentBalance(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rentalId, input }: { rentalId: string; input: TransferRentBalanceInput }) =>
      customerDebtsService.transferRentBalance(rentalId, input),
    onSuccess: (view) => {
      queryClient.setQueryData(customerDebtsKey(customerId), view);
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      toast.success("Saldo transferido para débito");
    },
  });
}

export function useAddCustomerDebtPayment(customerId: string, debtId: string) {
  return useCustomerDebtWrite(
    customerId,
    ({ input, key }: { input: CustomerDebtPaymentInput; key: string }) =>
      customerDebtsService.addPayment(debtId, input, key),
    "Pagamento registrado",
  );
}

export function useDeleteCustomerDebtPayment(customerId: string) {
  return useCustomerDebtWrite(
    customerId,
    (paymentId: string) => customerDebtsService.removePayment(paymentId),
    "Pagamento excluído",
  );
}
