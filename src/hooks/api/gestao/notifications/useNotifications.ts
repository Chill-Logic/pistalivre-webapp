import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { notificationsService } from "@/services/api/gestao/notifications.service";
import type {
  NotificationList,
  NotificationPreferenceInput,
} from "@/types/notification";

/** How many notices each page of the bell brings. */
export const NOTIFICATIONS_PAGE_SIZE = 30;

/**
 * The bell, 30 at a time (scrolling to the end loads the next ones, by the
 * oldest createdAt). New notices arrive by socket (`notification.created`
 * refreshes it); the unread count comes with the first page.
 */
export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => notificationsService.list(NOTIFICATIONS_PAGE_SIZE, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.items.length < NOTIFICATIONS_PAGE_SIZE ? undefined : last.items[last.items.length - 1]?.createdAt,
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
      const previous = queryClient.getQueryData<InfiniteData<NotificationList>>(key);
      if (previous) {
        const now = new Date().toISOString();
        const unread = previous.pages[0]?.unread ?? 0;
        queryClient.setQueryData<InfiniteData<NotificationList>>(key, {
          ...previous,
          pages: previous.pages.map((page, index) => ({
            items: page.items.map((n) =>
              !n.readAt && (!ids || ids.includes(n.id)) ? { ...n, readAt: now } : n,
            ),
            // The count lives on the first page.
            unread: index === 0 ? (ids ? Math.max(0, unread - ids.length) : 0) : page.unread,
          })),
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
