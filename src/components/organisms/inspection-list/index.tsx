import { ClipboardCheck } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  InspectionCard,
  InspectionCardSkeleton,
} from "@/components/molecules/inspection-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import type { InspectionListItem } from "@/types/inspection";
import { cn } from "@/utils/cn";

type InspectionListProps = {
  inspections: InspectionListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

export function InspectionList({
  inspections,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: InspectionListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando vistorias…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <InspectionCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!inspections?.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Nenhuma vistoria encontrada"
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
      {inspections.map((inspection) => (
        <Col as="li" key={inspection.id} sm={6} xl={4}>
          <InspectionCard inspection={inspection} />
        </Col>
      ))}
    </Row>
  );
}
