import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { rateLabel } from "@/helpers/rental";
import { vehicleName } from "@/helpers/vehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalRental } from "@/types/portal";
import { formatCalendarDate } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

/** What the renter agreed to: vehicle, period, price and how to pay. */
export function PortalRentalSummary({ rental }: { rental: PortalRental }) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Box className="min-w-0">
            <Heading className="break-words">
              {vehicleName(rental.vehicle)} {rental.vehicle.year}
            </Heading>
            <Text tone="muted" mono>
              {formatPlate(rental.vehicle.plate)} · {rental.code}
            </Text>
          </Box>
          <RentalStatusBadge status={rental.status} />
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={6} md={4} label="Início">
            {formatCalendarDate(rental.startDate)}
          </InfoItem>
          <InfoItem span={6} md={4} label="Fim">
            {rental.termination
              ? `Rescindida em ${formatCalendarDate(rental.termination.date)}`
              : rental.endDate
                ? formatCalendarDate(rental.endDate)
                : "Sem prazo"}
          </InfoItem>
          <InfoItem md={4} label="Valor">
            {rateLabel(
              rental.rate,
              label(LABEL_MAPS.ratePeriod, rental.ratePeriod),
            )}
          </InfoItem>
          <InfoItem span={6} md={4} label="Forma de pagamento">
            {rental.paymentMethod
              ? label(LABEL_MAPS.paymentMethod, rental.paymentMethod)
              : null}
          </InfoItem>
          <InfoItem span={6} md={4} label="Dia de pagamento">
            {rental.billingDayLabel ??
              (rental.paymentWeekday !== null
                ? label(LABEL_MAPS.weekday, rental.paymentWeekday)
                : null)}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

const SUMMARY_FIELDS = 5;

export function PortalRentalSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Box className="flex-1 space-y-2">
            <Skeleton shape="text" className="w-2/3 text-2xl" />
            <Skeleton shape="text" className="w-40 text-sm" />
          </Box>
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: SUMMARY_FIELDS }, (_, index) => (
            <Col key={index} span={6} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-24 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
