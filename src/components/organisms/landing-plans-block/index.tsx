import { Check } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { LandingSectionShell } from "@/components/molecules/landing-section-shell";
import type { LandingSectionStyle } from "@/types/landing";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { durationLabel } from "@/helpers/plan";
import { usePublicPlans } from "@/hooks/api/comum/public-site/usePublicSite";

export type LandingPlansProps = LandingSectionStyle & {
  title: string;
  /** What each plan includes (off while every plan includes the same). */
  showHighlights?: boolean;
};

/** The active plans, live: changing a price in Planos changes it here. */
export function LandingPlansBlock({
  title,
  showHighlights = false,
  background = "muted",
  spacing,
  backgroundImage,
}: LandingPlansProps) {
  // Active plans in the staff's order, from the public route.
  const plans = usePublicPlans();
  const items = plans.data ?? [];

  return (
    <LandingSectionShell background={background} spacing={spacing} imageUrl={backgroundImage}>
      <Box className="space-y-6">
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
                        {plan.price}
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
    </LandingSectionShell>
  );
}
