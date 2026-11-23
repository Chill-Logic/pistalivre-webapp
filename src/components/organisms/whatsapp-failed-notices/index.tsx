import { BellOff, Send } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { QueryError } from "@/components/organisms/query-error";
import {
  useFailedGroupNotices,
  useResendGroupNotice,
} from "@/hooks/api/gestao/notifications/useGroupNotices";
import type { FailedGroupNotice } from "@/types/notification";
import { formatDateTime, formatRelativeTime } from "@/utils/format";

/** The message without its first line ("🔔 *Título*"), already shown as the title. */
const bodyOf = (text: string) =>
  text.split("\n").slice(1).join("\n").trim();

/**
 * Integrações › WhatsApp (admin): the notices the group should have got but
 * didn't (the bridge or the tunnel was down, even after the automatic tries).
 * "Reenviar" has the bot send it now, as it was written.
 */
export function WhatsAppFailedNotices() {
  const failed = useFailedGroupNotices();
  const resend = useResendGroupNotice();
  const notices = failed.data ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <BellOff className="size-4" aria-hidden />
          Avisos que não chegaram ao grupo
        </CardTitle>
        {notices.length > 0 && (
          <Badge variant="warning">{notices.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {failed.isError ? (
          <QueryError error={failed.error} onRetry={() => failed.refetch()} />
        ) : failed.isPending ? (
          <Box className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </Box>
        ) : notices.length === 0 ? (
          <Text size="sm" tone="muted">
            Nenhum. Quando a ponte ou o túnel cair, o bot tenta de novo na hora;
            o que mesmo assim não chegar aparece aqui para reenviar.
          </Text>
        ) : (
          <List className="divide-y" aria-label="Avisos que não chegaram">
            {notices.map((notice) => (
              <FailedNoticeRow
                key={notice.key}
                notice={notice}
                pending={resend.isPending && resend.variables === notice.key}
                disabled={resend.isPending}
                onResend={() => resend.mutate(notice.key)}
              />
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

function FailedNoticeRow({
  notice,
  pending,
  disabled,
  onResend,
}: {
  notice: FailedGroupNotice;
  pending: boolean;
  disabled: boolean;
  onResend: () => void;
}) {
  const body = bodyOf(notice.text);
  return (
    <ListItem className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <Box className="min-w-0 flex-1 space-y-1">
        <Text size="sm" weight="semibold">
          {notice.title}
        </Text>
        {body && (
          <Text size="sm" className="whitespace-pre-line break-words">
            {body}
          </Text>
        )}
        <Text size="xs" tone="muted" title={formatDateTime(notice.failedAt)}>
          Falhou {formatRelativeTime(notice.failedAt)}
          {" · "}
          {notice.attempts === 1 ? "1 tentativa" : `${notice.attempts} tentativas`}
          {notice.lastError ? ` · ${notice.lastError}` : ""}
        </Text>
      </Box>
      <Button
        variant="outline"
        size="sm"
        onClick={onResend}
        disabled={disabled}
        aria-label={`Reenviar ao grupo: ${notice.title}`}
      >
        <Send />
        {pending ? "Reenviando…" : "Reenviar"}
      </Button>
    </ListItem>
  );
}
