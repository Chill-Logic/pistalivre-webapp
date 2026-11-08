import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { chargesService } from "@/services/api/gestao/charges.service";
import type { InstallmentPlanParams } from "@/types/charge";

/**
 * The server's split of a total into N installments (so the preview is
 * exactly what will be issued). Runs once the drivers are complete.
 */
export function useInstallmentPlan(params: InstallmentPlanParams) {
  const ready =
    params.total > 0 && params.count >= 1 && Boolean(params.firstDueDate);
  return useQuery({
    queryKey: queryKeys.installmentPlan(params),
    queryFn: () => chargesService.installmentPlan(params),
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });
}
