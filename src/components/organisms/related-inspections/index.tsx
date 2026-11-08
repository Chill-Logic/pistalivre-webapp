import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  InspectionCard,
  InspectionCardSkeleton,
} from "@/components/molecules/inspection-card";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { MAX_PAGE_SIZE } from "@/constants/pagination";
import { useInspections } from "@/hooks/api/gestao/inspections/useInspections";
import { pluralize } from "@/utils/text";

type RelatedInspectionsProps = { vehicleId?: string; rentalId?: string };

/** Vistorias of one vehicle or rental, newest first, loading on their own. */
export function RelatedInspections({
  vehicleId,
  rentalId,
}: RelatedInspectionsProps) {
  const query = useInspections({
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    q: "",
    type: "",
    performedBy: "",
    vehicleId,
    rentalId,
  });
  const items = query.data?.items ?? [];

  return (
    <CollapsibleCard
      title="Vistorias"
      count={query.data?.total}
      storageKey={`${rentalId ? "rental" : "vehicle"}-inspections`}
      contentClassName="space-y-3"
    >
      {query.isPending && (
        <SkeletonRegion label="Carregando vistorias…">
          <RelatedInspectionsGrid />
        </SkeletonRegion>
      )}
      {query.isError && (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      )}
      {query.data && items.length === 0 && (
        <Text tone="muted">Nenhuma vistoria registrada.</Text>
      )}
      {items.length > 0 && (
        <Row as="ul" className="gap-y-4">
          {items.map((inspection) => (
            <Col as="li" key={inspection.id} md={6}>
              <InspectionCard inspection={inspection} />
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
    </CollapsibleCard>
  );
}

function RelatedInspectionsGrid() {
  return (
    <Row className="gap-y-4">
      <Col md={6}>
        <InspectionCardSkeleton />
      </Col>
      <Col md={6} className="hidden md:block">
        <InspectionCardSkeleton />
      </Col>
    </Row>
  );
}

export function RelatedInspectionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <RelatedInspectionsGrid />
      </CardContent>
    </Card>
  );
}
