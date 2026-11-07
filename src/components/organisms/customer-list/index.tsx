import { Users } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import {
  CustomerCard,
  CustomerCardSkeleton,
} from "@/components/molecules/customer-card";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import type { CustomerListItem } from "@/types/customer";
import { cn } from "@/utils/cn";

type CustomerListProps = {
  customers: CustomerListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

export function CustomerList({
  customers,
  isLoading,
  isRefreshing = false,
  skeletonCount = 6,
}: CustomerListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando clientes…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <CustomerCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!customers?.length) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
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
      {customers.map((customer) => (
        <Col as="li" key={customer.id} sm={6} xl={4}>
          <CustomerCard customer={customer} />
        </Col>
      ))}
    </Row>
  );
}
