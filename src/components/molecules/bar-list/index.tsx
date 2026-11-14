import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { Meter } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import type { BarItem } from "@/types/chart";
import { maxOf, ratio } from "@/utils/number";

/**
 * Ranking / magnitude per item: label and value written out, the bar only
 * shows proportion. Rows with `to` lead to the detail screen.
 */
export function BarList({ items }: { items: BarItem[] }) {
  const max = maxOf(items.map((item) => item.value));
  return (
    <List className="space-y-3">
      {items.map((item) => (
        <ListItem key={item.key} className="space-y-1.5">
          <Box className="flex items-baseline justify-between gap-3">
            {item.to ? (
              <Link
                to={item.to}
                className="min-w-0 truncate text-sm font-medium hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <Text truncate className="min-w-0">
                {item.label}
              </Text>
            )}
            <Text inline weight="medium" className="shrink-0 tabular-nums">
              {item.display}
            </Text>
          </Box>
          <Meter
            value={ratio(item.value, max)}
            color="hsl(var(--foreground) / 0.7)"
            className="h-1.5"
          />
        </ListItem>
      ))}
    </List>
  );
}

export function BarListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Box className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <Box key={index} className="space-y-1.5">
          <Box className="flex justify-between gap-3">
            <Skeleton shape="text" className="w-32 text-sm" />
            <Skeleton shape="text" className="w-12 text-sm" />
          </Box>
          <Skeleton className="h-2.5 w-full" />
        </Box>
      ))}
    </Box>
  );
}
