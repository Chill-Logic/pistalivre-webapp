import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { InspectionDetail } from "@/types/inspection";
import { formatDateTime, formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function InspectionSummary({
  inspection,
}: {
  inspection: InspectionDetail;
}) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">
            {label(LABEL_MAPS.inspectionType, inspection.type)}
          </Heading>
          <Badge variant={inspection.rental ? "neutral" : "outline"}>
            {inspection.rental ? "Da locação" : "Avulsa"}
          </Badge>
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Veículo">
            <TextLink to={routeTo.vehicle(inspection.vehicle.id)}>
              {formatPlate(inspection.vehicle.plate)}
            </TextLink>{" "}
            · {inspection.vehicle.label}
          </InfoItem>
          <InfoItem md={6} label="Locação">
            {inspection.rental ? (
              <>
                <TextLink to={routeTo.rental(inspection.rental.id)}>
                  {inspection.rental.code}
                </TextLink>{" "}
                ·{" "}
                <TextLink to={routeTo.customer(inspection.rental.customer.id)}>
                  {inspection.rental.customer.name}
                </TextLink>
              </>
            ) : (
              "Sem locação"
            )}
          </InfoItem>
          <InfoItem span={6} md={4} label="Km">
            {inspection.mileage !== null
              ? formatMileage(inspection.mileage)
              : null}
          </InfoItem>
          <InfoItem span={6} md={4} label="Feita por">
            {label(LABEL_MAPS.inspectionActor, inspection.performedBy)}
          </InfoItem>
          <InfoItem md={4} label="Responsável">
            {inspection.performedByName}
          </InfoItem>
          <InfoItem md={6} label="Realizada em">
            {formatDateTime(inspection.createdAt)}
          </InfoItem>
        </Row>
        {inspection.notes && (
          <Box className="space-y-2">
            <Text size="xs" tone="muted">
              Observações
            </Text>
            <Text className="whitespace-pre-line">{inspection.notes}</Text>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const SUMMARY_FIELDS = 6;

export function InspectionSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: SUMMARY_FIELDS }, (_, index) => (
            <Col key={index} span={6} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-28 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
