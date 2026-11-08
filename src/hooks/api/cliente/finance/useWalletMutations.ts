import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { walletService } from "@/services/api/cliente/wallet.service";
import type { WalletMutations } from "@/types/portal";

/** Check, add, make default and remove pix keys of the renter's wallet. */
export function useWalletMutations(): WalletMutations {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.portal.wallet() });

  const preview = useMutation({ mutationFn: walletService.preview });
  const add = useMutation({
    mutationFn: walletService.add,
    onSuccess: () => {
      refresh();
      toast.success("Chave pix adicionada");
    },
  });
  const setDefault = useMutation({
    mutationFn: walletService.setDefault,
    onSuccess: () => {
      refresh();
      toast.success("Chave principal alterada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: walletService.remove,
    onSuccess: () => {
      refresh();
      toast.success("Chave pix removida");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { preview, add, setDefault, remove };
}
