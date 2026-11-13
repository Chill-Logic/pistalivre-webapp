import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { aiService } from "@/services/api/gestao/ai.service";

/** A proposal made outside (MCP) shows up on its own: the list refreshes. */
const REFRESH_MS = 15_000;

/** "Ações da IA": the proposals waiting for this person, and confirming/cancelling them. */
export function useAiActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.ai.actions() });

  const list = useQuery({
    queryKey: queryKeys.ai.actions(),
    queryFn: aiService.actions,
    refetchInterval: REFRESH_MS,
  });
  const confirm = useMutation({
    mutationFn: (id: string) => aiService.confirmAction(id),
    onSuccess: (done) => toast.success(`Feito: ${done.summary}`),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: refresh,
  });
  const cancel = useMutation({
    mutationFn: (id: string) => aiService.cancelAction(id),
    onSuccess: () => toast.success("Ação cancelada"),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: refresh,
  });
  return { list, confirm, cancel };
}
