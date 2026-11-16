import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { cardFeesService } from "@/services/api/gestao/card-fees.service";
import type { CardFeeBand } from "@/types/card-fees";

export function useCardFees() {
  return useQuery({ queryKey: queryKeys.cardFees(), queryFn: cardFeesService.get });
}

export function useSaveCardFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bands: CardFeeBand[] | null) => cardFeesService.save(bands),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cardFees(), data);
      toast.success(data.isDefault ? "Voltou às taxas padrão" : "Juros do cartão salvos");
    },
  });
}
