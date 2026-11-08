import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

/** Every proposal template, active or not (the models screen). */
export function useProposalTemplateList() {
  return useQuery({
    queryKey: queryKeys.templates.proposals(),
    queryFn: templatesService.proposals,
  });
}
