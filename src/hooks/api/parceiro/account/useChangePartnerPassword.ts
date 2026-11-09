import { useMutation } from "@tanstack/react-query";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/**
 * The API ends every session of the partner on a password change (no new
 * token comes back): the caller logs out and sends to the login.
 */
export function useChangePartnerPassword() {
  return useMutation({ mutationFn: partnerAreaService.changePassword });
}
