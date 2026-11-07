import { Wrench } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  MaintenanceCard,
  MaintenanceCardSkeleton,
} from "@/components/molecules/maintenance-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import type { MaintenanceListItem } from "@/types/maintenance";
import { cn } from "@/utils/cn";

type MaintenanceListProps = {
  maintenances: MaintenanceListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

export function MaintenanceList({
  maintenances,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: MaintenanceListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando manutenções…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <MaintenanceCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!maintenances?.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="Nenhuma manutenção encontrada"
        description="Ajuste a busca ou os filtros."
      />
    );
  }

  return (
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {maintenances.map((maintenance) => (
        <Col as="li" key={maintenance.id} sm={6} xl={4}>
          <MaintenanceCard maintenance={maintenance} />
        </Col>
      ))}
    </Row>
  );
}
