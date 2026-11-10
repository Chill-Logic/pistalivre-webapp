import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { categoriesService } from "@/services/api/gestao/categories.service";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesService.list,
  });
}
