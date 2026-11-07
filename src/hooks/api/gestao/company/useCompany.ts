import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { companyService } from "@/services/api/gestao/company.service";

export function useCompany() {
  return useQuery({
    queryKey: queryKeys.company.all,
    queryFn: companyService.get,
  });
}
