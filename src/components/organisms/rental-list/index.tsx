import { FileText } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  RentalCard,
  RentalCardSkeleton,
} from "@/components/molecules/rental-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import type { RentalListItem } from "@/types/rental";
import { cn } from "@/utils/cn";

type RentalListProps = {
  rentals: RentalListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

export function RentalList({
  rentals,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: RentalListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando locações…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <RentalCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!rentals?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma locação encontrada"
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
      {rentals.map((rental) => (
        <Col as="li" key={rental.id} sm={6} xl={4}>
          <RentalCard rental={rental} />
        </Col>
      ))}
    </Row>
  );
}
