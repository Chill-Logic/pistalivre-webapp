import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { CautionAutoToggle } from "@/components/organisms/caution-auto-toggle";
import { ChargeFormDialog } from "@/components/organisms/charge-form-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useCautionPlan } from "@/hooks/api/gestao/charges/useCautionPlan";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Caution, RatePeriod } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type RentalCautionCardProps = {
  caution: Caution | null;
  /** With it, "Emitir cobrança" (the parcels not charged yet) and the charged ones marked. */
  rental?: {
    id: string;
    rate: number;
    ratePeriod: RatePeriod;
    cautionAutoBilling?: boolean;
  };
};

/**
 * The caução the rental implies and, per row, whether it was already charged.
 * "Emitir cobrança" opens the charge dialog on the deposit: it emits only what
 * is still missing (the server skips what already went out).
 */
export function RentalCautionCard({ caution, rental }: RentalCautionCardProps) {
  const { label } = useLabels();
  const plan = useCautionPlan(rental?.id ?? "", Boolean(rental && caution));
  const emittedOn = new Set(
    (plan.data ?? [])
      .filter((item) => item.emitted)
      .map((item) => item.dueDate),
  );
  const pendingCount = (plan.data ?? []).filter((item) => !item.emitted).length;
  // The label the charge goes out with ("Parcela 2/4", "Entrada"), not the typed text.
  const labelOn = new Map(
    (plan.data ?? []).map((item) => [item.dueDate, item.label]),
  );
  // Sunday/holiday: the charge falls due on the next business day.
  const chargeDueOn = new Map(
    (plan.data ?? []).map((item) => [item.dueDate, item.chargeDueDate]),
  );
  const pushedNote = (planDate: string) => {
    const due = chargeDueOn.get(planDate);
    return due && due !== planDate
      ? ` · vence ${formatCalendarDate(due)} (próximo dia útil)`
      : "";
  };

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Caução</CardTitle>
          {rental && caution && pendingCount > 0 && (
            <ChargeFormDialog
              rentalId={rental.id}
              rate={rental.rate}
              ratePeriod={rental.ratePeriod}
              caution
            />
          )}
        </Box>
      </CardHeader>
      <CardContent className="space-y-4">
        {!caution ? (
          <Text tone="muted">Sem caução nesta locação.</Text>
        ) : (
          <>
            <Row as="dl" className="gap-y-4">
              <InfoItem label="Tipo">
                {label(LABEL_MAPS.cautionType, caution.type)}
              </InfoItem>
              <InfoItem span={6} label="Total">
                {formatCurrency(caution.total)}
              </InfoItem>
              {caution.installmentValue !== null && (
                <InfoItem span={6} label="Parcela">
                  {formatCurrency(caution.installmentValue)}
                  {caution.weekday !== null &&
                    ` · ${label(LABEL_MAPS.weekday, caution.weekday)}`}
                </InfoItem>
              )}
            </Row>
            {/* Nothing left to charge (all emitted): no automation to turn on. */}
            {rental && (pendingCount > 0 || rental.cautionAutoBilling) && (
              <CautionAutoToggle
                rentalId={rental.id}
                enabled={Boolean(rental.cautionAutoBilling)}
                plan={plan.data ?? []}
              />
            )}
            {caution.installments && caution.installments.length > 0 && (
              <List className="divide-y rounded-md border">
                {[...caution.installments]
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .map((installment, index) => (
                    <ListItem
                      key={`${installment.dueDate}-${index}`}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <Box className="min-w-0">
                        <Text truncate>
                          {labelOn.get(installment.dueDate) ??
                            installment.label}
                        </Text>
                        <Text size="xs" tone="muted">
                          {formatCalendarDate(installment.dueDate)}
                          {pushedNote(installment.dueDate)}
                          {emittedOn.has(installment.dueDate) &&
                            " · cobrança emitida"}
                        </Text>
                      </Box>
                      <Text weight="medium">
                        {formatCurrency(installment.amount)}
                      </Text>
                    </ListItem>
                  ))}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalCautionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-12 text-xs" />
            <Skeleton shape="text" className="w-40 text-sm" />
          </Col>
          <Col span={6} className="space-y-2">
            <Skeleton shape="text" className="w-12 text-xs" />
            <Skeleton shape="text" className="w-20 text-sm" />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
