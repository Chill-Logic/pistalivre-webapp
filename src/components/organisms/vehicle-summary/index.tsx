import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { effectiveVehicleStatus, vehicleName } from "@/helpers/vehicle";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function VehicleSummary({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Box className="flex items-start justify-between gap-2">
          <Heading className="font-mono tracking-wide">
            {formatPlate(vehicle.plate)}
          </Heading>
          <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
        </Box>
        <Text tone="muted">
          {vehicleName(vehicle)} · {vehicle.year}
        </Text>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={6} md={4} label="Tipo">
            {vehicle.type.name}
          </InfoItem>
          <InfoItem span={6} md={4} label="Categoria">
            {vehicle.category.name}
          </InfoItem>
          <InfoItem span={6} md={4} label="Km atual">
            {vehicle.currentMileage !== null
              ? formatMileage(vehicle.currentMileage)
              : "Sem leitura"}
          </InfoItem>
          <InfoItem span={6} md={4} label="Cor">
            {vehicle.color}
          </InfoItem>
          <InfoItem span={6} md={4} label="Chassi" mono>
            {vehicle.chassis}
          </InfoItem>
          <InfoItem span={6} md={4} label="Renavam" mono>
            {vehicle.renavam}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

const SUMMARY_FIELDS = 6;

export function VehicleSummarySkeleton() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-36 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
        <Skeleton shape="text" className="w-2/3 text-sm" />
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
