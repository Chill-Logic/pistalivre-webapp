import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { DescriptionList } from "@/components/atoms/description-list";
import { Heading } from "@/components/atoms/heading";
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
        <DescriptionList className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <InfoItem label="Tipo">{vehicle.type.name}</InfoItem>
          <InfoItem label="Categoria">{vehicle.category.name}</InfoItem>
          <InfoItem label="Km atual">
            {vehicle.currentMileage !== null
              ? formatMileage(vehicle.currentMileage)
              : "Sem leitura"}
          </InfoItem>
          <InfoItem label="Cor">{vehicle.color}</InfoItem>
          <InfoItem label="Chassi" mono>
            {vehicle.chassis}
          </InfoItem>
          <InfoItem label="Renavam" mono>
            {vehicle.renavam}
          </InfoItem>
        </DescriptionList>
      </CardContent>
    </Card>
  );
}
