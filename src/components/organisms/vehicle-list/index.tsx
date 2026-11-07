import { CarFront } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { VehicleCard } from "@/components/molecules/vehicle-card";
import type { Vehicle } from "@/types/vehicle";

const SKELETON_ROWS = 6;
const GRID = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3";

type VehicleListProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
};

/** Cards stacked on mobile, grid from `sm` up. */
export function VehicleList({ vehicles, isLoading }: VehicleListProps) {
  if (isLoading) {
    return (
      <Box className={GRID}>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </Box>
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
    <List className={GRID}>
      {vehicles.map((vehicle) => (
        <ListItem key={vehicle.id} className="min-w-0">
          <VehicleCard vehicle={vehicle} />
        </ListItem>
      ))}
    </List>
  );
}
