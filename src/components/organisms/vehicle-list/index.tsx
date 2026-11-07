import { CarFront } from "lucide-react";
import { List, ListItem } from "@/components/atoms/list";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/molecules/vehicle-card";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/utils/cn";

const GRID = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3";

type VehicleListProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
  /** Showing the previous page/filter while the next one loads. */
  isRefreshing?: boolean;
  skeletonCount?: number;
};

/** Cards stacked on mobile, grid from `sm` up. */
export function VehicleList({
  vehicles,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: VehicleListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando veículos…">
        <List className={GRID}>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <ListItem key={index} className="min-w-0">
              <VehicleCardSkeleton />
            </ListItem>
          ))}
        </List>
      </SkeletonRegion>
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
    <List
      aria-busy={isRefreshing}
      className={cn(
        GRID,
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {vehicles.map((vehicle) => (
        <ListItem key={vehicle.id} className="min-w-0">
          <VehicleCard vehicle={vehicle} />
        </ListItem>
      ))}
    </List>
  );
}
