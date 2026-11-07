import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";
import type { LeadInput } from "@/types/crm";

/** Errors are mapped onto the form fields by the caller. */
export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadInput) => crmService.createLead(input),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
      queryClient.setQueryData(queryKeys.crm.lead(lead.id), lead);
      toast.success("Lead cadastrado");
    },
  });
}
