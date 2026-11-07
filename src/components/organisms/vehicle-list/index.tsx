import { CarFront } from "lucide-react";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import type { Vehicle } from "@/types/vehicle";
import { formatPlate } from "@/utils/plate";

const SKELETON_ROWS = 6;

type VehicleListProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
};

/** Cards stacked on mobile, grid from `sm` up. */
export function VehicleList({ vehicles, isLoading }: VehicleListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <EmptyState
        icon={CarFront}
        title="Nenhum veículo encontrado"
        description="Ajuste a busca ou os filtros."
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <li key={vehicle.id}>
          <Card className="flex h-full flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-lg font-semibold tracking-wide">
                {formatPlate(vehicle.plate)}
              </p>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <p className="truncate text-sm">
              {vehicle.brand.name} {vehicle.model.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {vehicle.type.name} · {vehicle.category.name} · {vehicle.year}
              {vehicle.color && ` · ${vehicle.color}`}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
