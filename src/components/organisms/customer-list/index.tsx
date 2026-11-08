import { Users } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import {
  CustomerCard,
  CustomerCardSkeleton,
} from "@/components/molecules/customer-card";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { CustomerAsaasStatus } from "@/components/organisms/customer-asaas-status";
import type { AsaasDirectory, CustomerListItem } from "@/types/customer";
import { cn } from "@/utils/cn";

type CustomerListProps = {
  customers: CustomerListItem[] | undefined;
  /** For the "Em ambos" tag and the "Vincular" button. */
  asaasDirectory?: AsaasDirectory;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

export function CustomerList({
  customers,
  asaasDirectory,
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
              <CustomerCardSkeleton footer />
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
          <CustomerCard
            customer={customer}
            footer={
              <>
                <Text size="xs" tone="muted">
                  Asaas
                </Text>
                <CustomerAsaasStatus
                  customer={customer}
                  directory={asaasDirectory}
                />
              </>
            }
          />
        </Col>
      ))}
    </Row>
  );
}
