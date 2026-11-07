import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

export function useContractTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.contracts(),
    queryFn: templatesService.contracts,
  });
}
