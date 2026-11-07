import { CarFront } from "lucide-react";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { VehicleCard } from "@/components/molecules/vehicle-card";
import type { Vehicle } from "@/types/vehicle";

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
          <Skeleton key={index} className="h-28" />
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
          <VehicleCard vehicle={vehicle} />
        </li>
      ))}
    </ul>
  );
}
