import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { categoriesService } from "@/services/api/gestao/categories.service";
import type { VehicleCategoryInput } from "@/types/category";

/**
 * Create, rename and delete a category. The vehicle form and the fleet show
 * the category's name, so they refetch too.
 */
export function useCategoryWrites() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicleFormOptions.all,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all }),
    ]);

  const create = useMutation({
    mutationFn: (input: VehicleCategoryInput) => categoriesService.create(input),
    onSuccess: () => {
      void refresh();
      toast.success("Categoria criada");
    },
  });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoriesService.rename(id, name),
    onSuccess: () => {
      void refresh();
      toast.success("Categoria renomeada");
    },
  });
  const remove = useMutation({
    mutationFn: categoriesService.remove,
    onSuccess: () => {
      void refresh();
      toast.success("Categoria excluída");
    },
  });

  return { create, rename, remove };
}
