import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { aiUsageModel, aiUsageTask, aiUsageTokens } from "@/helpers/ai-usage";
import { useLabels } from "@/hooks/ui/useLabels";
import type { AiUsageEntry } from "@/types/ai-usage";
import { cn } from "@/utils/cn";
import { formatDateTime, formatUsd } from "@/utils/format";

type AiUsageListProps = {
  entries: AiUsageEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
};

/** The month's AI calls on the phone (cards, 10 by 10 on scroll). */
export function AiUsageList({ entries, isLoading, isRefreshing }: AiUsageListProps) {
  const { label } = useLabels();
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando chamadas…">
        <Box className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="space-y-2 p-4">
              <Box className="flex justify-between">
                <Skeleton shape="text" className="w-40" />
                <Skeleton shape="text" className="w-16" />
              </Box>
              <Skeleton shape="text" className="w-2/3 text-xs" />
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
      className={cn("space-y-3 transition-opacity duration-200", isRefreshing && "opacity-60")}
    >
      {entries?.map((entry) => (
        <ListItem key={entry.id}>
          <Card className="space-y-1 p-4">
            <Box className="flex items-start justify-between gap-3">
              <Text weight="medium" className="min-w-0 break-words">
                {aiUsageTask(entry, label)}
              </Text>
              <Text weight="semibold" className="tabular-nums">
                {formatUsd(entry.costUsd)}
              </Text>
            </Box>
            <Text size="xs" tone="muted">
              {formatDateTime(entry.createdAt)} · {entry.userName ?? "—"}
            </Text>
            <Text size="xs" tone="muted" className="break-all">
              {aiUsageModel(entry, label)}
            </Text>
            <Text size="xs" tone="muted">
              {aiUsageTokens(entry)}
            </Text>
          </Card>
        </ListItem>
      ))}
    </List>
  );
}
