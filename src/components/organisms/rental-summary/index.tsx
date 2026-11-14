import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { rateLabel } from "@/helpers/rental";
import { vehicleName } from "@/helpers/vehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ColSpans } from "@/helpers/grid";
import type { RentalDetail } from "@/types/rental";
import { formatCpf } from "@/utils/document";
import { formatCalendarDate } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function RentalSummary({ rental }: { rental: RentalDetail }) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-center justify-between gap-2">
          <Heading className="uppercase tracking-[0.04em]">{rental.code}</Heading>
          <Box className="flex gap-2">
            {rental.source === "MANUAL" && (
              <Badge variant="outline">Retroativa</Badge>
            )}
            <RentalStatusBadge status={rental.status} />
          </Box>
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Locatário">
            <TextLink to={routeTo.customer(rental.customer.id)}>
              {rental.customer.name}
            </TextLink>
            {rental.customer.document && (
              <Text size="xs" tone="muted">
                CPF {formatCpf(rental.customer.document)}
              </Text>
            )}
          </InfoItem>
          <InfoItem md={6} label="Veículo">
            <TextLink to={routeTo.vehicle(rental.vehicle.id)}>
              {formatPlate(rental.vehicle.plate)}
            </TextLink>{" "}
            · {vehicleName(rental.vehicle)} {rental.vehicle.year}
          </InfoItem>
          <InfoItem span={6} md={4} label="Início">
            {formatCalendarDate(rental.startDate)}
          </InfoItem>
          <InfoItem span={6} md={4} label="Fim">
            {rental.endDate ? formatCalendarDate(rental.endDate) : "Sem prazo"}
          </InfoItem>
          <InfoItem md={4} label="Valor">
            {rateLabel(
              rental.rate,
              label(LABEL_MAPS.ratePeriod, rental.ratePeriod),
            )}
          </InfoItem>
          {rental.notes && (
            <InfoItem label="Observações">{rental.notes}</InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

/** Same columns as RentalSummary: locatário, veículo, início, fim, valor. */
const SUMMARY_FIELDS: ColSpans[] = [
  { md: 6 },
  { md: 6 },
  { span: 6, md: 4 },
  { span: 6, md: 4 },
  { md: 4 },
];

export function RentalSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-center justify-between gap-2">
          <Skeleton shape="text" className="w-44 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {SUMMARY_FIELDS.map((spans, index) => (
            <Col key={index} {...spans} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-36 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
