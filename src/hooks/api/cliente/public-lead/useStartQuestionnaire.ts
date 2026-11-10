import { useMutation } from "@tanstack/react-query";
import { publicLeadService } from "@/services/api/cliente/public-lead.service";

/** Opens the lead and its questionnaire session (returns the token). */
export function useStartQuestionnaire() {
  return useMutation({ mutationFn: publicLeadService.start });
}
