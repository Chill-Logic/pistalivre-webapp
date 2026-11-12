import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useAttribution } from "@/hooks/ui/useAttribution";
import { publicLeadService } from "@/services/api/cliente/public-lead.service";
import type { PreRegistrationInput } from "@/types/public-lead";

/** /pre-cadastro: the form's options, and sending it (returns the WhatsApp link or null). */
export function usePreRegistration() {
  const attribution = useAttribution();
  const info = useQuery({
    queryKey: queryKeys.publicLead.preRegistration(),
    queryFn: publicLeadService.preRegistrationInfo,
    staleTime: Infinity,
  });
  const submit = useMutation({
    mutationFn: (input: PreRegistrationInput) =>
      publicLeadService.submitPreRegistration(input, attribution),
  });
  return { info, submit };
}
