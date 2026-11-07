import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { BarList, BarListSkeleton } from "@/components/molecules/bar-list";
import type { BarItem } from "@/types/chart";

type BarListCardProps = {
  title: string;
  items: BarItem[];
  /** Shown instead of the list when there is nothing to rank. */
  empty: string;
  /** One line above the list (totals, counts). */
  summary?: ReactNode;
};

export function BarListCard({
  title,
  items,
  empty,
  summary,
}: BarListCardProps) {
  const hasData = items.some((item) => item.value > 0);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <Text size="xs" tone="muted">
            {summary}
          </Text>
        )}
        {hasData ? (
          <BarList items={items} />
        ) : (
          <Text tone="muted" className="py-6 text-center">
            {empty}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

export function BarListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent>
        <BarListSkeleton rows={rows} />
      </CardContent>
    </Card>
  );
}
