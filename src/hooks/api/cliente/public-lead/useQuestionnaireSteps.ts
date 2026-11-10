import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { publicLeadService } from "@/services/api/cliente/public-lead.service";
import type { QualificationInput, RegistrationInput } from "@/types/public-lead";

/** The three answers; each one moves the questionnaire to its next step. */
export function useQuestionnaireSteps(token: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.publicLead.questionnaire(token),
    });

  const qualification = useMutation({
    mutationFn: (input: QualificationInput) =>
      publicLeadService.saveQualification(token, input),
    onSuccess: refresh,
  });
  const plan = useMutation({
    mutationFn: (planId: string) => publicLeadService.choosePlan(token, planId),
    onSuccess: refresh,
  });
  const registration = useMutation({
    mutationFn: (input: RegistrationInput) =>
      publicLeadService.submitRegistration(token, input),
    onSuccess: refresh,
  });

  return { qualification, plan, registration };
}
