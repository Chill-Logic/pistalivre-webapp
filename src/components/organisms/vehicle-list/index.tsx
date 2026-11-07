import { CarFront } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/molecules/vehicle-card";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/utils/cn";

type VehicleListProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
  /** Showing the previous page/filter while the next one loads. */
  isRefreshing?: boolean;
  skeletonCount?: number;
};

/** Cards stacked on mobile, 2 columns from `sm`, 3 from `xl`. */
export function VehicleList({
  vehicles,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: VehicleListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando veículos…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <VehicleCardSkeleton />
            </Col>
          ))}
        </Row>
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
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6",
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {vehicles.map((vehicle) => (
        <Col as="li" key={vehicle.id} sm={6} xl={4}>
          <VehicleCard vehicle={vehicle} />
        </Col>
      ))}
    </Row>
  );
}
