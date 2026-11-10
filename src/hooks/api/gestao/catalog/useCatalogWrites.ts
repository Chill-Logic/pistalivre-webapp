import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { catalogService } from "@/services/api/gestao/catalog.service";
import type { CatalogItemInput } from "@/types/catalog";

/** Create/edit/delete a catalogue item and its picture. */
export function useCatalogWrites() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CatalogItemInput }) =>
      id ? catalogService.update(id, input) : catalogService.create(input),
    // A new brand/model created here shows up in the vehicle form too.
    onSuccess: () =>
      Promise.all([
        refresh(),
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicleFormOptions.all }),
      ]),
  });
  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      catalogService.uploadImage(id, file),
    onSuccess: refresh,
  });
  const removeImage = useMutation({
    mutationFn: catalogService.removeImage,
    onSuccess: () => {
      void refresh();
      toast.success("Imagem removida");
    },
  });
  const remove = useMutation({
    mutationFn: catalogService.remove,
    onSuccess: () => {
      void refresh();
      toast.success("Removido do catálogo");
    },
  });

  return { save, uploadImage, removeImage, remove };
}
