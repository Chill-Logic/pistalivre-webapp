import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { standaloneChargesService } from "@/services/api/gestao/standalone-charges.service";
import { pluralize } from "@/utils/text";

/** "Sincronizar do Asaas": missed webhooks and NOT_RECORDED charges. */
export function useFinanceSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: standaloneChargesService.sync,
    onSuccess: ({ imported, updated }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(
        imported + updated === 0
          ? "Tudo em dia com o Asaas"
          : `Sincronizado: ${pluralize(imported, "cobrança nova", "cobranças novas")}, ${pluralize(updated, "atualizada", "atualizadas")}`,
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
