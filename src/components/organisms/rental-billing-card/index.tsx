import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ColSpan } from "@/helpers/grid";
import type { RentalDetail } from "@/types/rental";

export function RentalBillingCard({ rental }: { rental: RentalDetail }) {
  const { label } = useLabels();
  const skipDays = rental.billingSkipWeekdays
    .map((day) => label(LABEL_MAPS.weekday, day))
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cobrança</CardTitle>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={6} label="Forma">
            {rental.paymentMethod
              ? label(LABEL_MAPS.paymentMethod, rental.paymentMethod)
              : null}
          </InfoItem>
          <InfoItem span={6} label="Dia">
            {rental.billingDayLabel ??
              (rental.paymentWeekday !== null
                ? label(LABEL_MAPS.weekday, rental.paymentWeekday)
                : null)}
          </InfoItem>
          <InfoItem span={6} label="Canal">
            {rental.billingChannel === "manual" ? "Fora do Asaas" : "Asaas"}
          </InfoItem>
          <InfoItem span={6} label="Automática">
            {rental.autoBillingEnabled ? "Ligada" : "Desligada"}
          </InfoItem>
          <InfoItem label="Vencimento">
            {label(LABEL_MAPS.rentBillingTiming, rental.rentBillingTiming)}
          </InfoItem>
          {rental.ratePeriod === "DAILY" && (
            <InfoItem label="Dias sem cobrança">
              {skipDays || "Nenhum"}
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

const BILLING_FIELDS: ColSpan[] = [6, 6, 6, 6, 12];

export function RentalBillingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {BILLING_FIELDS.map((span, index) => (
            <Col key={index} span={span} className="space-y-2">
              <Skeleton shape="text" className="w-14 text-xs" />
              <Skeleton shape="text" className="w-24 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
