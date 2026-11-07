import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  ToCollectItem,
  ToCollectItemSkeleton,
} from "@/components/molecules/to-collect-item";
import { dueDayLabel, lateLabel } from "@/helpers/finance";
import type { ToCollect } from "@/types/finance";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

/**
 * "A receber": what is due today and what is overdue, one block per due day
 * (today on top, the oldest delay at the bottom), with each day's subtotal.
 */
export function ToCollectTimeline({ toCollect }: { toCollect: ToCollect }) {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">A receber</CardTitle>
          {toCollect.count > 0 && (
            <Text tone="muted" className="tabular-nums">
              {formatCurrency(toCollect.total)} ·{" "}
              {pluralize(toCollect.count, "cobrança", "cobranças")}
            </Text>
          )}
        </Box>
      </CardHeader>
      <CardContent className="space-y-5">
        {toCollect.days.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="Nada a receber hoje"
            description="Nenhuma cobrança vence hoje nem está atrasada."
          />
        )}
        {toCollect.days.map((day) => {
          const late = lateLabel(day.daysLate);
          return (
            <Box key={day.dueDate}>
              <Box className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <Box className="flex items-center gap-2">
                  <Heading level={3} variant="section">
                    {dueDayLabel(day.dueDate, day.daysLate)}
                  </Heading>
                  {late && <Badge variant="error">{late}</Badge>}
                </Box>
                <Text weight="medium" className="tabular-nums">
                  {formatCurrency(day.total)}
                </Text>
              </Box>
              <Box className="divide-y">
                {day.items.map((item) => (
                  <ToCollectItem key={item.id} item={item} />
                ))}
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ToCollectTimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-5">
        {[2, 1].map((rows, index) => (
          <Box key={index}>
            <Box className="flex items-center justify-between gap-2 border-b pb-2">
              <Skeleton shape="text" className="w-28 text-base" />
              <Skeleton shape="text" className="w-20 text-sm" />
            </Box>
            {Array.from({ length: rows }, (_, row) => (
              <ToCollectItemSkeleton key={row} />
            ))}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
