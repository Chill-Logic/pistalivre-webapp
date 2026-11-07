import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  MaintenanceCard,
  MaintenanceCardSkeleton,
} from "@/components/molecules/maintenance-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { MAX_PAGE_SIZE } from "@/constants/pagination";
import { useMaintenances } from "@/hooks/api/gestao/maintenances/useMaintenances";
import { pluralize } from "@/utils/text";

type RelatedMaintenancesProps = { vehicleId?: string; rentalId?: string };

/** Manutenções of one vehicle or rental, newest first, loading on their own. */
export function RelatedMaintenances({
  vehicleId,
  rentalId,
}: RelatedMaintenancesProps) {
  const query = useMaintenances({
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    q: "",
    type: "",
    vehicleId,
    rentalId,
  });
  const items = query.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manutenções</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isPending && (
          <SkeletonRegion label="Carregando manutenções…">
            <RelatedMaintenancesGrid />
          </SkeletonRegion>
        )}
        {query.isError && (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
        {query.data && items.length === 0 && (
          <Text tone="muted">Nenhuma manutenção registrada.</Text>
        )}
        {items.length > 0 && (
          <Row as="ul" className="gap-y-4">
            {items.map((maintenance) => (
              <Col as="li" key={maintenance.id} md={6}>
                <MaintenanceCard maintenance={maintenance} />
              </Col>
            ))}
          </Row>
        )}
        {query.data && query.data.total > items.length && (
          <Text size="xs" tone="muted">
            Mostrando {items.length} de{" "}
            {pluralize(query.data.total, "registro", "registros")}.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

function RelatedMaintenancesGrid() {
  return (
    <Row className="gap-y-4">
      <Col md={6}>
        <MaintenanceCardSkeleton />
      </Col>
      <Col md={6} className="hidden md:block">
        <MaintenanceCardSkeleton />
      </Col>
    </Row>
  );
}

export function RelatedMaintenancesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <RelatedMaintenancesGrid />
      </CardContent>
    </Card>
  );
}
