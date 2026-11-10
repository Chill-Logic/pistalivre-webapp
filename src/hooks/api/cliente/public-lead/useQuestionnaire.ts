import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { toApiError } from "@/helpers/api-error";
import { publicLeadService } from "@/services/api/cliente/public-lead.service";

/** The questionnaire's current step. An expired link (410) is not retried. */
export function useQuestionnaire(token: string) {
  return useQuery({
    queryKey: queryKeys.publicLead.questionnaire(token),
    queryFn: () => publicLeadService.questionnaire(token),
    retry: (count, error) => toApiError(error).status !== 410 && count < 2,
  });
}
