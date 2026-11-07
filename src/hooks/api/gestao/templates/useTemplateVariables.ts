import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

/** Variables the contract editor can insert (derived from the schema). */
export function useTemplateVariables() {
  return useQuery({
    queryKey: queryKeys.templates.variables(),
    queryFn: () => templatesService.variables(),
    staleTime: 30 * 60_000,
  });
}
