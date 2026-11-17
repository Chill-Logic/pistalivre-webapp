import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { cardFeesService } from "@/services/api/gestao/card-fees.service";
import type { CardAnticipation, CardFeeBand } from "@/types/card-fees";

export function useCardFees() {
  return useQuery({
    queryKey: queryKeys.cardFees(),
    queryFn: cardFeesService.get,
  });
}

/**
 * The example table for what is TYPED (not saved yet), computed by the server.
 * Keeps the last table while the next one loads; invalid bands → error.
 */
export function useCardFeesPreview(
  input: {
    bands: CardFeeBand[];
    anticipation: CardAnticipation;
    amount: number;
  } | null,
) {
  return useQuery({
    queryKey: [...queryKeys.cardFees(), "preview", input],
    queryFn: () => cardFeesService.preview(input!),
    enabled: input !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useSaveCardFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bands,
      anticipation,
    }: {
      bands: CardFeeBand[] | null;
      anticipation?: CardAnticipation;
    }) => cardFeesService.save(bands, anticipation),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cardFees(), data);
      toast.success(
        data.isDefault ? "Voltou às taxas padrão" : "Juros do cartão salvos",
      );
    },
  });
}
