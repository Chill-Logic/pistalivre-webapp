import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { DebtCard, DebtCardSkeleton } from "@/components/molecules/debt-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { useVehicleDebts } from "@/hooks/api/gestao/debts/useVehicleDebts";
import { pluralize } from "@/utils/text";

/**
 * The debts attributed to one vehicle (the bank financing, a loan that paid
 * a repair…). The same debts as in Finance; here it's the vehicle's slice.
 */
export function VehicleDebts({ vehicleId }: { vehicleId: string }) {
  const query = useVehicleDebts(vehicleId);
  const items = query.data?.items ?? [];

  return (
    <CollapsibleCard
      title="Dívidas do veículo"
      count={query.data?.total}
      storageKey="vehicle-debts"
      contentClassName="space-y-3"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to={routeTo.newDebtForVehicle(vehicleId)}>
            <Plus />
            Registrar dívida
          </Link>
        </Button>
      }
    >
      {query.isPending && (
        <SkeletonRegion label="Carregando dívidas…">
          <VehicleDebtsGrid />
        </SkeletonRegion>
      )}
      {query.isError && (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      )}
      {query.data && items.length === 0 && (
        <Text tone="muted">
          Nenhuma dívida registrada para este veículo. O financiamento entra
          aqui: credor, valor, quando começou e em quantas parcelas.
        </Text>
      )}
      {items.length > 0 && (
        <Row as="ul" className="gap-y-4">
          {items.map((debt) => (
            <Col as="li" key={debt.id} md={6} xl={4}>
              <DebtCard debt={debt} />
            </Col>
          ))}
        </Row>
      )}
      {query.data && query.data.total > items.length && (
        <Text size="xs" tone="muted">
          Mostrando {items.length} de{" "}
          {pluralize(query.data.total, "dívida", "dívidas")}.
        </Text>
      )}
    </CollapsibleCard>
  );
}

function VehicleDebtsGrid() {
  return (
    <Row className="gap-y-4">
      <Col md={6} xl={4}>
        <DebtCardSkeleton />
      </Col>
      <Col md={6} xl={4} className="hidden md:block">
        <DebtCardSkeleton />
      </Col>
    </Row>
  );
}

export function VehicleDebtsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent>
        <VehicleDebtsGrid />
      </CardContent>
    </Card>
  );
}
