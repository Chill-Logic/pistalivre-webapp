import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { toApiError } from "@/helpers/api-error";
import { notificationsService } from "@/services/api/gestao/notifications.service";
import type { GroupNoticeSettings } from "@/types/notification";

/** Integrações › WhatsApp › Avisos no grupo: what goes to the group (ADMIN). */
export function useGroupNotices() {
  return useQuery({ queryKey: queryKeys.notifications.groupNotices(), queryFn: notificationsService.groupNotices });
}

export function useSaveGroupNotices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: GroupNoticeSettings) => notificationsService.saveGroupNotices(settings),
    onSuccess: () => toast.success("Avisos do grupo salvos"),
    onError: (error) => toast.error(toApiError(error).message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.groupNotices() }),
  });
}

export function useTestGroupNotice() {
  return useMutation({
    mutationFn: () => notificationsService.testGroupNotice(),
    onSuccess: () => toast.success("Aviso de teste enviado ao grupo"),
    onError: (error) => toast.error(toApiError(error).message),
  });
}
