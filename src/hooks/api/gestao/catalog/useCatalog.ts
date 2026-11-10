import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { catalogService } from "@/services/api/gestao/catalog.service";

/** The catalogue + the model/year of the fleet still out of it. */
export function useCatalog() {
  return useQuery({ queryKey: queryKeys.catalog.all, queryFn: catalogService.overview });
}
