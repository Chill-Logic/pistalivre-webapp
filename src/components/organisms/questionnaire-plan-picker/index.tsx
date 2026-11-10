import { Check } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { errorMessage } from "@/helpers/api-error";
import type { QuestionnairePlan } from "@/types/public-lead";
import { cn } from "@/utils/cn";

type QuestionnairePlanPickerProps = {
  plans: QuestionnairePlan[];
  pending: boolean;
  error: unknown;
  onChoose: (planId: string) => void;
};

/**
 * Step 2: the plans, straight from the plans registered in the staff area
 * (price and terms formatted by the server), so changing a price there
 * changes what the customer sees here.
 */
export function QuestionnairePlanPicker({
  plans,
  pending,
  error,
  onChoose,
}: QuestionnairePlanPickerProps) {
  const [selected, setSelected] = useState(plans[0]?.id ?? "");

  if (!plans.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Text tone="muted">
            Estamos atualizando nossos planos. Nossa equipe vai falar com você
            em breve pelo WhatsApp.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className="space-y-4">
      <List className="space-y-3" aria-label="Planos">
        {plans.map((plan) => {
          const active = plan.id === selected;
          return (
            <ListItem key={plan.id}>
              <Button
                type="button"
                variant="outline"
                aria-pressed={active}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "h-auto w-full flex-col items-stretch gap-0 whitespace-normal p-4 text-left font-normal",
                  active && "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <Box className="flex flex-wrap items-start justify-between gap-2">
                  <Box className="min-w-[12rem] flex-1">
                    <Text weight="semibold" size="base">
                      {plan.name}
                    </Text>
                    {plan.description && (
                      <Text tone="muted" className="mt-0.5">
                        {plan.description}
                      </Text>
                    )}
                  </Box>
                  {plan.ownershipAtEnd && (
                    <Badge variant="success" className="shrink-0 whitespace-nowrap">
                      Ao final a moto é sua
                    </Badge>
                  )}
                </Box>
                <Text size="2xl" weight="bold" tone="primary" className="mt-3">
                  {plan.price}
                </Text>
                <Text size="xs" tone="muted">
                  {plan.terms}
                </Text>
                {plan.highlights.length > 0 && (
                  <List className="mt-3 space-y-1">
                    {plan.highlights.map((highlight) => (
                      <ListItem key={highlight} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <Text>{highlight}</Text>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Button>
            </ListItem>
          );
        })}
      </List>
      {error ? <Alert>{errorMessage(error)}</Alert> : null}
      <Button
        className="w-full"
        disabled={pending || !selected}
        onClick={() => onChoose(selected)}
      >
        {pending && <Spinner className="text-primary-foreground" />}
        Quero este plano
      </Button>
    </Box>
  );
}
