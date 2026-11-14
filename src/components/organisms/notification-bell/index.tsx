import { Bell, Settings2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { NotificationItem } from "@/components/molecules/notification-item";
import { ROUTES } from "@/constants/routes";
import { toAppPath } from "@/helpers/app-path";
import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/hooks/api/gestao/notifications/useNotifications";
import type { AppNotification } from "@/types/notification";

const dayKey = (value: string) => new Date(value).toDateString();

/** "Hoje", "Ontem", "Anteriores", in the order the list already has. */
function groupByDay(items: AppNotification[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const label = (n: AppNotification) =>
    dayKey(n.createdAt) === today.toDateString()
      ? "Hoje"
      : dayKey(n.createdAt) === yesterday.toDateString()
        ? "Ontem"
        : "Anteriores";
  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const item of items) {
    const name = label(item);
    const last = groups[groups.length - 1];
    if (last?.label === name) last.items.push(item);
    else groups.push({ label: name, items: [item] });
  }
  return groups;
}

/**
 * The bell in the header: unread count, the list by day and "marcar todas
 * como lidas". Opening a notice marks it read and goes to the screen that
 * resolves it. New ones arrive live (socket) and every 5 min as a fallback.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const unread = notifications.data?.unread ?? 0;
  const items = notifications.data?.items ?? [];

  const openNotice = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate([notification.id]);
    setOpen(false);
    if (notification.url) navigate(toAppPath(notification.url));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unread ? `Notificações (${unread} não lidas)` : "Notificações"}
          title="Notificações"
          className="relative"
        >
          <Bell />
          {unread > 0 && (
            <Text
              inline
              size={null}
              aria-hidden
              className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground md:right-0.5 md:top-0.5"
            >
              {unread > 99 ? "99+" : unread}
            </Text>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex max-h-[min(560px,calc(100dvh-5rem))] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden"
      >
        <Box className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <Text weight="semibold">Notificações</Text>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 h-auto px-2 py-1 text-xs md:h-auto"
              onClick={() => markRead.mutate(undefined)}
            >
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        <Box className="min-h-0 flex-1 overflow-y-auto">
          {notifications.isPending ? (
            <Box className="space-y-4 p-4">
              {[0, 1, 2].map((index) => (
                <Box key={index} className="space-y-1.5">
                  <Skeleton shape="text" className="w-40 text-sm" />
                  <Skeleton shape="text" className="w-56 text-xs" />
                </Box>
              ))}
            </Box>
          ) : items.length === 0 ? (
            <Box className="px-4 py-10 text-center">
              <Text tone="muted">Nenhuma notificação por enquanto.</Text>
            </Box>
          ) : (
            groupByDay(items).map((group) => (
              <Box key={group.label}>
                <Text size="xs" tone="muted" weight="medium" className="px-4 pb-1 pt-3">
                  {group.label}
                </Text>
                <Box className="divide-y">
                  {group.items.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} onOpen={openNotice} />
                  ))}
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Box className="border-t p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.notificationSettings);
            }}
          >
            <Settings2 />
            Preferências de notificação
          </Button>
        </Box>
      </PopoverContent>
    </Popover>
  );
}
