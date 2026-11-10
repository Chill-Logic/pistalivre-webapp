import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { publicLeadService } from "@/services/api/cliente/public-lead.service";

/** Company name and the models in stock, for the public lead forms. */
export function useLeadForm() {
  return useQuery({
    queryKey: queryKeys.publicLead.form(),
    queryFn: publicLeadService.leadForm,
    staleTime: 5 * 60_000,
  });
}
