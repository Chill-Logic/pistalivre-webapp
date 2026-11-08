import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

export function useProposalTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.templates.proposal(id),
    queryFn: () => templatesService.proposal(id),
  });
}
