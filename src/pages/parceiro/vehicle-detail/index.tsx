import { Bike } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { PartnerVehicleStatusBadge } from "@/components/molecules/partner-area-status-badge";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  PartnerAreaInspectionsCard,
  PartnerAreaInspectionsCardSkeleton,
} from "@/components/organisms/partner-area-inspections-card";
import {
  PartnerAreaMaintenancesCard,
  PartnerAreaMaintenancesCardSkeleton,
} from "@/components/organisms/partner-area-maintenances-card";
import {
  PartnerAreaRentalsCard,
  PartnerAreaRentalsCardSkeleton,
} from "@/components/organisms/partner-area-rentals-card";
import {
  PartnerAreaVehicleSummary,
  PartnerAreaVehicleSummarySkeleton,
} from "@/components/organisms/partner-area-vehicle-summary";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartnerVehicle } from "@/hooks/api/parceiro/area/usePartnerVehicle";

/**
 * One of the partner's motorcycles: data, when it is in the contract, and
 * what happened while it was theirs (rentals, maintenance, inspections).
 */
export function PartnerVehiclePage() {
  const { id = "" } = useParams();
  const query = usePartnerVehicle(id);

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.partnerArea} label="Meus contratos" />
      {query.isPending && <PartnerVehicleSkeleton />}
      {query.isError &&
        (isNotFound(query.error) ? (
          <EmptyState
            icon={Bike}
            title="Moto não encontrada"
            description="Esta moto não está entre as suas. Confira o endereço ou volte para os seus contratos."
            action={
              <Button asChild variant="outline">
                <Link to={ROUTES.partnerArea}>Ver meus contratos</Link>
              </Button>
            }
          />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        ))}
      {query.data && (
        <Box className="space-y-6">
          <PageHeader
            title={query.data.vehicle.label}
            actions={
              <PartnerVehicleStatusBadge status={query.data.vehicle.status} />
            }
          />
          <Row className="gap-y-6">
            <Col lg={4} className="space-y-6">
              <PartnerAreaVehicleSummary detail={query.data} />
              <Box className="hidden lg:block">
                <PartnerAreaInspectionsCard
                  inspections={query.data.inspections}
                />
              </Box>
            </Col>
            <Col lg={8}>
              <PartnerAreaRentalsCard rentals={query.data.rentals} />
            </Col>
            <Col>
              <PartnerAreaMaintenancesCard
                maintenances={query.data.maintenances}
              />
            </Col>
            <Col className="lg:hidden">
              <PartnerAreaInspectionsCard
                inspections={query.data.inspections}
              />
            </Col>
          </Row>
        </Box>
      )}
    </Box>
  );
}

function PartnerVehicleSkeleton() {
  return (
    <SkeletonRegion label="Carregando moto…" className="space-y-6">
      <Box className="flex items-center justify-between gap-3">
        <Skeleton shape="text" className="w-64 text-2xl" />
        <Skeleton shape="pill" className="h-5 w-16" />
      </Box>
      <Row className="gap-y-6">
        <Col lg={4} className="space-y-6">
          <PartnerAreaVehicleSummarySkeleton />
          <Box className="hidden lg:block">
            <PartnerAreaInspectionsCardSkeleton />
          </Box>
        </Col>
        <Col lg={8}>
          <PartnerAreaRentalsCardSkeleton />
        </Col>
        <Col>
          <PartnerAreaMaintenancesCardSkeleton />
        </Col>
        <Col className="lg:hidden">
          <PartnerAreaInspectionsCardSkeleton />
        </Col>
      </Row>
    </SkeletonRegion>
  );
}
