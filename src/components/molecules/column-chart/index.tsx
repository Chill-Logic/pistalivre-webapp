import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { List, ListItem } from "@/components/atoms/list";
import { Meter, Swatch } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { useSelectedKey } from "@/hooks/ui/useSelectedKey";
import type { ChartSeries, ColumnGroup } from "@/types/chart";
import { cn } from "@/utils/cn";
import { maxOf, ratio } from "@/utils/number";

type ColumnChartProps = {
  groups: ColumnGroup[];
  series: ChartSeries[];
  format: (value: number) => string;
};

/**
 * Vertical bars over time (one group per month). Tapping a month writes its
 * numbers under the chart — works the same on touch and mouse, unlike a
 * hover tooltip. Starts on the latest month.
 */
export function ColumnChart({ groups, series, format }: ColumnChartProps) {
  const max = maxOf(
    groups.flatMap((group) =>
      series.map((item) => group.values[item.key] ?? 0),
    ),
  );
  const [selectedKey, select] = useSelectedKey(
    groups.map((group) => group.key),
    groups[groups.length - 1]?.key,
  );
  const selected = groups.find((group) => group.key === selectedKey);

  return (
    <Box className="space-y-3">
      <List className="flex h-40 items-end gap-0.5 border-b md:gap-1">
        {groups.map((group) => (
          <ListItem key={group.key} className="flex h-full min-w-0 flex-1">
            <Button
              type="button"
              variant="ghost"
              aria-label={group.label}
              aria-pressed={group.key === selectedKey}
              onClick={() => select(group.key)}
              className="h-full w-full items-end gap-px rounded-b-none px-0.5 md:h-full"
            >
              {series.map((item) => (
                <Meter
                  key={item.key}
                  orientation="vertical"
                  className="max-w-4 bg-transparent"
                  value={ratio(group.values[item.key] ?? 0, max)}
                  color={item.color}
                />
              ))}
            </Button>
          </ListItem>
        ))}
      </List>
      <Box className="flex gap-0.5 md:gap-1" aria-hidden>
        {groups.map((group, index) => (
          <Text
            key={group.key}
            tone={group.key === selectedKey ? "foreground" : "muted"}
            weight={group.key === selectedKey ? "semibold" : "normal"}
            className={cn(
              "min-w-0 flex-1 whitespace-nowrap text-center text-[10px]",
              index % 2 === groups.length % 2 &&
                group.key !== selectedKey &&
                "invisible md:visible",
            )}
          >
            {group.label}
          </Text>
        ))}
      </Box>
      {selected && (
        <Box className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-muted/50 px-3 py-2">
          <Text weight="medium">{selected.label}</Text>
          {series.map((item) => (
            <Box key={item.key} className="flex items-center gap-1.5">
              <Swatch color={item.color} />
              <Text inline size="xs" tone="muted">
                {item.name}
              </Text>
              <Text inline weight="medium" className="tabular-nums">
                {format(selected.values[item.key] ?? 0)}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function ColumnChartSkeleton() {
  return (
    <Box className="space-y-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton shape="text" className="w-full text-xs" />
      <Skeleton className="h-9 w-full" />
    </Box>
  );
}
