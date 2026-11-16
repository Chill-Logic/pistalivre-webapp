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
import { ChargeFormDialog } from "@/components/organisms/charge-form-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useCautionPlan } from "@/hooks/api/gestao/charges/useCautionPlan";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Caution, RatePeriod } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type RentalCautionCardProps = {
  caution: Caution | null;
  /** With it, "Emitir cobrança" (the parcels not charged yet) and the charged ones marked. */
  rental?: { id: string; rate: number; ratePeriod: RatePeriod };
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
    (plan.data ?? []).filter((item) => item.emitted).map((item) => item.dueDate),
  );
  const pendingCount = (plan.data ?? []).filter((item) => !item.emitted).length;

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
            {caution.installments && caution.installments.length > 0 && (
              <List className="divide-y rounded-md border">
                {caution.installments.map((installment, index) => (
                  <ListItem
                    key={`${installment.dueDate}-${index}`}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <Box className="min-w-0">
                      <Text truncate>{installment.label}</Text>
                      <Text size="xs" tone="muted">
                        {formatCalendarDate(installment.dueDate)}
                        {emittedOn.has(installment.dueDate) && " · cobrança emitida"}
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
