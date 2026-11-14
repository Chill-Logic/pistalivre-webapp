import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { notificationsService } from "@/services/api/gestao/notifications.service";
import type {
  NotificationList,
  NotificationPreferenceInput,
} from "@/types/notification";

/** The bell. New notices arrive by socket (`notification.created` refreshes it). */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsService.list(),
    staleTime: 60_000,
    // A missed socket (sleeping laptop, flaky 4G) still catches up.
    refetchInterval: 5 * 60_000,
  });
}

/** Read one, some or all (no ids). Optimistic: the dot and the count go at once. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const key = queryKeys.notifications.list();
  return useMutation({
    mutationFn: (ids?: string[]) => notificationsService.markRead(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationList>(key);
      if (previous) {
        const now = new Date().toISOString();
        const items = previous.items.map((n) =>
          !n.readAt && (!ids || ids.includes(n.id)) ? { ...n, readAt: now } : n,
        );
        queryClient.setQueryData<NotificationList>(key, {
          items,
          unread: ids ? Math.max(0, previous.unread - ids.length) : 0,
        });
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => notificationsService.settings(),
  });
}

export function useSaveNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (types: NotificationPreferenceInput) => notificationsService.saveSettings(types),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.notifications.settings(), data),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** ADMIN only: what each group may receive and the digest hour. */
export function useNotificationAdmin(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.admin(),
    queryFn: () => notificationsService.admin(),
    enabled,
  });
}

export function useSaveRoleNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, types }: { role: string; types: string[] }) =>
      notificationsService.saveRole(role, types),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.admin(), data);
      // The admin's own "allowed" column may have changed.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings() });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useSaveDigestHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hour: number) => notificationsService.saveDigestHour(hour),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.admin(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings() });
      toast.success("Horário do resumo salvo");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useSendTestNotification() {
  return useMutation({
    mutationFn: () => notificationsService.sendTest(),
    onSuccess: ({ devices }) =>
      toast.success(
        devices
          ? "Aviso de teste enviado para o sininho e para os seus aparelhos"
          : "Aviso de teste enviado para o sininho",
      ),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
