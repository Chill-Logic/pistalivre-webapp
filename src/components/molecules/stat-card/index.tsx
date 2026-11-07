import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** Short note under the number (counts, unavailable sources). */
  hint?: ReactNode;
  tone?: "default" | "destructive" | "muted";
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-1 p-4 md:p-5 md:pt-5">
        <Text size="xs" tone="muted" weight="medium">
          {label}
        </Text>
        <Text
          size="2xl"
          weight="bold"
          tone={tone === "default" ? "foreground" : tone}
          // Half-width cards on a phone: smaller there. A muted value is a
          // state, not a number ("Indisponível"), so it reads smaller still.
          className={cn(
            "tabular-nums leading-tight",
            tone === "muted" ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
          )}
        >
          {value}
        </Text>
        {hint && (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="space-y-2 p-4 md:p-5 md:pt-5">
        <Skeleton shape="text" className="w-20 text-xs" />
        <Skeleton shape="text" className="w-28 text-2xl" />
        <Skeleton shape="text" className="w-16 text-xs" />
      </CardContent>
    </Card>
  );
}
