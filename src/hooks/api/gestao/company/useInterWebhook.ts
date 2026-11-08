import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { companyService } from "@/services/api/gestao/company.service";

/**
 * The callback registered at the Inter. It asks the bank live, so it only
 * runs when asked (`enabled`) and is not retried.
 */
export function useInterWebhook(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.company.interWebhook,
    queryFn: companyService.interWebhook,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

/** Registers our callbacks at the Inter (a real change at the bank). */
export function useRegisterInterWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => companyService.registerInterWebhook(url),
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.company.interWebhook,
        result.transferUrl,
      );
    },
  });
}
