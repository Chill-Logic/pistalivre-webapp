import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";
import type { PartnerAreaHome } from "@/types/partner-area";

/** Phone and pix key: the saved values go straight into the cached profile. */
export function useUpdatePartnerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: partnerAreaService.updateProfile,
    onSuccess: (saved) => {
      queryClient.setQueryData<PartnerAreaHome>(
        queryKeys.partnerArea.home(),
        (home) => (home ? { ...home, partner: { ...home.partner, ...saved } } : home),
      );
      toast.success("Dados salvos");
    },
  });
}
