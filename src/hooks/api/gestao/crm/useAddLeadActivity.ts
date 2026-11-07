import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { crmService } from "@/services/api/gestao/crm.service";
import type { LeadActivityInput } from "@/types/crm";

/**
 * Logs an SDR activity, then uploads its attachments one per request. The
 * activity is already saved when an upload fails, so that is reported apart
 * (`failedFiles`) instead of failing the whole thing — retrying would log the
 * activity twice.
 */
export function useAddLeadActivity(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeadActivityInput & { files: File[] }) => {
      const activity = await crmService.addActivity(leadId, {
        type: input.type,
        note: input.note,
      });
      const failedFiles: string[] = [];
      for (const file of input.files) {
        try {
          await crmService.attachToActivity(activity.id, file);
        } catch {
          failedFiles.push(file.name);
        }
      }
      return { activity, failedFiles };
    },
    onSuccess: ({ failedFiles }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.lead(leadId) });
      if (failedFiles.length > 0) {
        toast.warning(
          `Atividade registrada, mas não foi possível anexar: ${failedFiles.join(", ")}`,
        );
      } else {
        toast.success("Atividade registrada");
      }
    },
  });
}
