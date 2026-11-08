import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

/** Variables the proposal editor can insert (and the `{{{clauses}}}` slot). */
export function useProposalTemplateVariables() {
  return useQuery({
    queryKey: queryKeys.templates.proposalVariables(),
    queryFn: () => templatesService.proposalVariables(),
    staleTime: 30 * 60_000,
  });
}
