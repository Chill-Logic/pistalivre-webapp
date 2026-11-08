import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { companyService } from "@/services/api/gestao/company.service";
import type { Company, IntegrationInput } from "@/types/company";

/** Saves one provider (admin only). The answer replaces the list. */
export function useSaveIntegration(provider: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IntegrationInput) =>
      companyService.saveIntegration(provider, input),
    onSuccess: (items) => {
      queryClient.setQueryData(queryKeys.company.integrations, items);
      // The company carries the same flags (configured/active).
      queryClient.setQueryData<Company>(queryKeys.company.all, (company) =>
        company
          ? {
              ...company,
              integrations: items.map(
                ({ provider: id, label, configured, active }) => ({
                  provider: id,
                  label,
                  configured,
                  active,
                }),
              ),
            }
          : company,
      );
      toast.success("Integração salva");
    },
  });
}

/** Live test with the stored credentials; the result is shown in place. */
export function useTestIntegration(provider: string) {
  return useMutation({
    mutationFn: () => companyService.testIntegration(provider),
  });
}
