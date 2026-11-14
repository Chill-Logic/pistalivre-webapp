import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { auditChannel, auditGap, auditWho } from "@/helpers/ai-audit";
import type { AiAuditEntry } from "@/types/ai";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

type AiGapListProps = {
  entries: AiAuditEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (id: string) => void;
};

/** The unanswered questions on the phone (cards, 10 by 10). */
export function AiGapList({
  entries,
  isLoading,
  isRefreshing,
  onOpen,
}: AiGapListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando perguntas…">
        <Box className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="space-y-2 p-4">
              <Skeleton shape="text" className="w-full" />
              <Skeleton shape="pill" className="h-5 w-24" />
              <Skeleton shape="text" className="w-1/2 text-xs" />
            </Card>
          ))}
        </Box>
      </SkeletonRegion>
    );
  }
  return (
    <List
      aria-busy={isRefreshing}
      className={cn(
        "space-y-3 transition-opacity",
        isRefreshing && "opacity-60",
      )}
    >
      {entries?.map((entry) => {
        const gap = auditGap(entry);
        return (
          <ListItem key={entry.id}>
            <Button
              type="button"
              variant="ghost"
              className="h-auto md:h-auto w-full p-0 text-left"
              onClick={() => onOpen(entry.id)}
            >
              <Card className="w-full space-y-2 p-4">
                <Text weight="medium" className="whitespace-normal break-words">
                  {gap.question || "—"}
                </Text>
                <Badge variant="outline">{gap.reason}</Badge>
                {gap.detail && (
                  <Text
                    size="xs"
                    tone="muted"
                    className="whitespace-normal break-words"
                  >
                    {gap.detail}
                  </Text>
                )}
                <Text size="xs" tone="muted" className="whitespace-normal">
                  {formatDateTime(entry.createdAt)} · {auditChannel(entry)} ·{" "}
                  {auditWho(entry)}
                </Text>
              </Card>
            </Button>
          </ListItem>
        );
      })}
    </List>
  );
}
