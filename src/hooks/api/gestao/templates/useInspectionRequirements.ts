import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { templatesService } from "@/services/api/gestao/templates.service";

export function useInspectionRequirements() {
  return useQuery({
    queryKey: queryKeys.templates.inspection(),
    queryFn: templatesService.inspection,
  });
}
