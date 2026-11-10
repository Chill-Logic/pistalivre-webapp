import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { catalogService } from "@/services/api/gestao/catalog.service";
import type { CatalogVariantInput } from "@/types/catalog";

/** The colours of one catalogue item: add (with its picture), cover, remove. */
export function useCatalogVariants(itemId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });

  const add = useMutation({
    mutationFn: async ({ input, file }: { input: CatalogVariantInput; file: File | null }) => {
      const item = await catalogService.addVariant(itemId, input);
      const created = item.variants.find(
        (v) => v.color.trim().toLowerCase() === input.color.trim().toLowerCase(),
      );
      if (file && created) await catalogService.uploadVariantImage(itemId, created.id, file);
    },
    onSuccess: () => {
      void refresh();
      toast.success("Cor adicionada");
    },
  });
  const setDefault = useMutation({
    mutationFn: (variantId: string) => catalogService.setDefaultVariant(itemId, variantId),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (variantId: string) => catalogService.removeVariant(itemId, variantId),
    onSuccess: () => {
      void refresh();
      toast.success("Cor removida");
    },
  });

  return { add, setDefault, remove };
}
