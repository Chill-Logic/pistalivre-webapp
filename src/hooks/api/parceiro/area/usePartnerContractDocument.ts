import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { partnerAreaService } from "@/services/api/parceiro/partner-area.service";

/** Opens the contract's PDF (Bearer → blob) in a new tab. */
export function usePartnerContractDocument() {
  return useMutation({
    mutationFn: (contractId: string) =>
      openBlobInNewTab(() => partnerAreaService.contractDocument(contractId)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
