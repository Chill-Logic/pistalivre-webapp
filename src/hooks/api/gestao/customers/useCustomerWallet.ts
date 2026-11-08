import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { customerWalletService } from "@/services/api/gestao/customer-wallet.service";
import type { WalletKeyInput, WalletMutations } from "@/types/portal";

/** Lives under the customer's keys, so customer invalidation reaches it. */
const walletKey = (customerId: string) =>
  [...queryKeys.customers.all, "wallet", customerId] as const;

/** The customer's validated pix keys (where refunds go). */
export function useCustomerWallet(customerId: string) {
  return useQuery({
    queryKey: walletKey(customerId),
    queryFn: () => customerWalletService.list(customerId),
  });
}

/** Check, add, make default and remove a pix key, done by the team. */
export function useCustomerWalletMutations(
  customerId: string,
): WalletMutations {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: walletKey(customerId) });

  const preview = useMutation({
    mutationFn: (input: Pick<WalletKeyInput, "pixKeyType" | "pixKey">) =>
      customerWalletService.preview(customerId, input),
  });
  const add = useMutation({
    mutationFn: (input: WalletKeyInput) =>
      customerWalletService.add(customerId, input),
    onSuccess: () => {
      refresh();
      toast.success("Chave pix adicionada");
    },
  });
  const setDefault = useMutation({
    mutationFn: (methodId: string) =>
      customerWalletService.setDefault(customerId, methodId),
    onSuccess: () => {
      refresh();
      toast.success("Chave principal alterada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (methodId: string) =>
      customerWalletService.remove(customerId, methodId),
    onSuccess: () => {
      refresh();
      toast.success("Chave pix removida");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { preview, add, setDefault, remove };
}
