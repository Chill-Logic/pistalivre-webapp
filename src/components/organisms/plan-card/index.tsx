import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { durationLabel, planConditions } from "@/helpers/plan";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Plan } from "@/types/plan";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

/** A plan as the public questionnaire shows it — price is real data. */
export function PlanCard({
  plan,
  actions,
}: {
  plan: Plan;
  /** Edit/remove buttons (the gestão list). */
  actions?: ReactNode;
}) {
  const { label } = useLabels();
  return (
    <Card className={cn("flex h-full flex-col", !plan.active && "opacity-70")}>
      <CardHeader className="gap-2">
        <Box className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          {!plan.active && <Badge variant="outline">Inativo</Badge>}
        </Box>
        <Text>
          <Text inline size="2xl" weight="bold" className="tabular-nums">
            {formatCurrency(plan.rate)}
          </Text>
          <Text inline tone="muted">
            {" "}
            / {label(
              LABEL_MAPS.ratePeriod,
              plan.ratePeriod,
            ).toLowerCase()} · {durationLabel(plan.durationMonths)}
          </Text>
        </Text>
        {planConditions(plan).length > 0 && (
          <Box className="flex flex-wrap gap-1">
            {planConditions(plan).map((condition) => (
              <Badge key={condition} variant="neutral">
                {condition}
              </Badge>
            ))}
          </Box>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {plan.description && <Text tone="muted">{plan.description}</Text>}
        {plan.highlights.length > 0 && (
          <List className="space-y-2">
            {plan.highlights.map((highlight) => (
              <ListItem key={highlight} className="flex gap-2">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-success-foreground"
                  aria-hidden
                />
                <Text>{highlight}</Text>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      {actions && (
        <CardFooter className="justify-end gap-2 border-t pt-4 md:pt-4">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}

export function PlanCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="gap-2">
        <Skeleton shape="text" className="w-32 text-lg" />
        <Skeleton shape="text" className="w-40 text-2xl" />
        <Skeleton shape="pill" className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} shape="text" className="w-3/4 text-sm" />
        ))}
      </CardContent>
    </Card>
  );
}
