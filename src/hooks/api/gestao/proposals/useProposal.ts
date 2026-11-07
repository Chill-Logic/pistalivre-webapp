import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { proposalsService } from "@/services/api/gestao/proposals.service";

export function useProposal(id: string) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id),
    queryFn: () => proposalsService.get(id),
  });
}
