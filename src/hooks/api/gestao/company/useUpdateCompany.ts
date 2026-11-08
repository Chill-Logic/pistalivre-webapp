import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { companyService } from "@/services/api/gestao/company.service";
import type { CompanyInput } from "@/types/company";

/** Registration data. Errors are mapped onto the form fields. */
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => companyService.update(input),
    onSuccess: (company) => {
      queryClient.setQueryData(queryKeys.company.all, company);
      toast.success("Dados da empresa salvos");
    },
  });
}
