import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { auditChannel, auditEvent, auditWho } from "@/helpers/ai-audit";
import type { AiAuditEntry } from "@/types/ai";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

type AiAuditListProps = {
  entries: AiAuditEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (id: string) => void;
  toolTitle: (name: string) => string;
};

/** The audit on the phone (cards, 10 by 10); a card opens the event in full. */
export function AiAuditList({ entries, isLoading, isRefreshing, onOpen, toolTitle }: AiAuditListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando auditoria…">
        <Box className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="space-y-2 p-4">
              <Skeleton shape="text" className="w-2/3" />
              <Skeleton shape="text" className="w-1/2 text-xs" />
            </Card>
          ))}
        </Box>
      </SkeletonRegion>
    );
  }
  return (
    <List aria-busy={isRefreshing} className={cn("space-y-3 transition-opacity", isRefreshing && "opacity-60")}>
      {entries?.map((entry) => (
        <ListItem key={entry.id}>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full p-0 text-left"
            onClick={() => onOpen(entry.id)}
          >
            <Card className="w-full space-y-1 p-4">
              <Box className="flex items-start justify-between gap-2">
                <Text weight="medium" className="min-w-0 whitespace-normal break-words">
                  {auditEvent(entry, toolTitle)}
                </Text>
                <Badge variant={entry.ok ? "success" : "error"} className="shrink-0">
                  {entry.ok ? "Sucesso" : "Falha"}
                </Badge>
              </Box>
              <Text size="xs" tone="muted" className="whitespace-normal">
                {formatDateTime(entry.createdAt)} · {auditChannel(entry)}
              </Text>
              <Text size="xs" tone="muted" className="whitespace-normal">
                {auditWho(entry)}
              </Text>
            </Card>
          </Button>
        </ListItem>
      ))}
    </List>
  );
}
