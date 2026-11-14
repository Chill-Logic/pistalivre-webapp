import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/format";

type NotificationItemProps = {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
};

/** One line of the bell: unread dot, what happened, the detail and when. */
export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const unread = !notification.readAt;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onOpen(notification)}
      className="h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-none px-4 py-3 text-left font-normal md:h-auto"
    >
      <Box
        aria-hidden
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")}
      />
      <Box className="min-w-0 flex-1 space-y-0.5">
        <Text weight={unread ? "semibold" : "medium"}>{notification.title}</Text>
        {notification.body && (
          <Text size="xs" tone="muted" className="line-clamp-2">
            {notification.body}
          </Text>
        )}
        <Text size="xs" tone="muted">
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </Box>
    </Button>
  );
}
