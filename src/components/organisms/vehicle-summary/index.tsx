import { Card, CardContent, CardHeader } from "@/components/atoms/card";
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
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-mono text-2xl font-bold tracking-wide">
            {formatPlate(vehicle.plate)}
          </h1>
          <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
        </div>
        <p className="text-sm text-muted-foreground">
          {vehicleName(vehicle)} · {vehicle.year}
        </p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
        </dl>
      </CardContent>
    </Card>
  );
}
