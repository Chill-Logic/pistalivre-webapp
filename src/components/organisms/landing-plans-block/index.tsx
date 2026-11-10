import { Check } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ratePeriodSuffix } from "@/helpers/billing";
import { durationLabel, sortPlans } from "@/helpers/plan";
import { usePlans } from "@/hooks/api/gestao/plans/usePlans";
import { formatCurrency } from "@/utils/format";

export type LandingPlansProps = {
  title: string;
  /** What each plan includes (off while every plan includes the same). */
  showHighlights?: boolean;
};

/** The active plans, live: changing a price in Planos changes it here. */
export function LandingPlansBlock({ title, showHighlights = false }: LandingPlansProps) {
  const plans = usePlans();
  const items = sortPlans(plans.data ?? []).filter((plan) => plan.active);

  return (
    <Box className="bg-muted/40 px-4 py-12 md:px-10">
      <Box className="mx-auto max-w-6xl space-y-6">
        <Heading level={2} className="text-center text-2xl md:text-3xl">
          {title}
        </Heading>
        <Row className="gap-y-4">
          {plans.isPending
            ? [0, 1, 2].map((index) => (
                <Col key={index} md={4}>
                  <Skeleton className="h-56 rounded-xl" />
                </Col>
              ))
            : items.map((plan) => (
                <Col key={plan.id} md={4}>
                  <Card className="h-full">
                    <CardContent className="space-y-3 pt-6 md:pt-6">
                      {/* The badge never breaks: without room it moves, whole, to
                          the line below the plan's name. */}
                      <Box className="flex flex-wrap items-start justify-between gap-2">
                        <Text size="base" weight="semibold" className="min-w-[8rem] flex-1">
                          {plan.name}
                        </Text>
                        {plan.ownershipAtEnd && (
                          <Badge variant="success" className="shrink-0 whitespace-nowrap">
                            Ao final é seu
                          </Badge>
                        )}
                      </Box>
                      <Text size="2xl" weight="bold" tone="primary">
                        {formatCurrency(plan.rate)} /{ratePeriodSuffix(plan.ratePeriod)}
                      </Text>
                      <Text size="xs" tone="muted">
                        {durationLabel(plan.durationMonths)}
                      </Text>
                      {showHighlights && plan.highlights.length > 0 && (
                        <List className="space-y-1">
                          {plan.highlights.map((highlight) => (
                            <ListItem key={highlight} className="flex items-start gap-2">
                              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                              <Text>{highlight}</Text>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Col>
              ))}
        </Row>
      </Box>
    </Box>
  );
}
