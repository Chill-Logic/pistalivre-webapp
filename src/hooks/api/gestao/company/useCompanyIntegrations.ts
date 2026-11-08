import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { companyService } from "@/services/api/gestao/company.service";

/** Providers' catalog + what is stored (secrets only as `isSet`). */
export function useCompanyIntegrations() {
  return useQuery({
    queryKey: queryKeys.company.integrations,
    queryFn: companyService.integrations,
  });
}
