import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import { projectionsService } from "@/services/api/gestao/projections.service";

/** Opens the accountant's PDF of the scenario on screen. */
export function useProjectionReport() {
  return useMutation({
    mutationFn: (sim: string) =>
      openBlobInNewTab(() => projectionsService.report(sim)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
