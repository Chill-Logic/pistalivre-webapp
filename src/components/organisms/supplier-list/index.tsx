import { Store } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  SupplierCard,
  SupplierCardSkeleton,
} from "@/components/molecules/supplier-card";
import type { SupplierListRow } from "@/types/supplier";
import { cn } from "@/utils/cn";

type SupplierListProps = {
  suppliers: SupplierListRow[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function SupplierList({
  suppliers,
  isLoading,
  isRefreshing = false,
}: SupplierListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando custos fixos…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <SupplierCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!suppliers?.length) {
    return (
      <EmptyState
        icon={Store}
        title="Nenhum custo fixo encontrado"
        description="Custos fixos da empresa e dos veículos aparecem aqui."
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
      {suppliers.map((supplier) => (
        <Col as="li" key={supplier.id} sm={6} xl={4}>
          <SupplierCard supplier={supplier} />
        </Col>
      ))}
    </Row>
  );
}
