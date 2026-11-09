import { FileText, Receipt } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  PartnerAreaCyclesCard,
  PartnerAreaCyclesCardSkeleton,
} from "@/components/organisms/partner-area-cycles-card";
import {
  PartnerAreaPaymentsCard,
  PartnerAreaPaymentsCardSkeleton,
} from "@/components/organisms/partner-area-payments-card";
import {
  PartnerAreaRentSituation,
  PartnerAreaRentSituationSkeleton,
} from "@/components/organisms/partner-area-rent-situation";
import {
  PartnerAreaRentalSummary,
  PartnerAreaRentalSummarySkeleton,
} from "@/components/organisms/partner-area-rental-summary";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePartnerRental } from "@/hooks/api/parceiro/area/usePartnerRental";

/**
 * A rental of the partner's vehicle, cut to the partner's window: the
 * renter's name, the rent's situation and its cycles and payments — all
 * computed on the server (the same math as the customer's statement).
 */
export function PartnerRentalPage() {
  const { id = "" } = useParams();
  const query = usePartnerRental(id);
  const rental = query.data?.rental;
  const statement = query.data?.statement;

  return (
    <Box className="space-y-4">
      <BackLink
        to={
          rental
            ? routeTo.partnerAreaVehicle(rental.vehicleId)
            : ROUTES.partnerArea
        }
        label={rental?.vehicleLabel ?? "Meus contratos"}
      />
      {query.isPending && <PartnerRentalSkeleton />}
      {query.isError &&
        (isNotFound(query.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Esta locação não é de um veículo seu (ou é de antes dele entrar no seu contrato)."
            action={
              <Button asChild variant="outline">
                <Link to={ROUTES.partnerArea}>Ver meus contratos</Link>
              </Button>
            }
          />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        ))}
      {rental && (
        <Box className="space-y-6">
          <PageHeader
            title={rental.customerName}
            actions={<RentalStatusBadge status={rental.status} />}
          />
          <Row className="gap-y-6">
            <Col lg={4}>
              <PartnerAreaRentalSummary rental={rental} />
            </Col>
            <Col lg={8}>
              {statement ? (
                <PartnerAreaRentSituation
                  situation={statement.situation}
                  totalPaid={statement.totalPaid}
                />
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="Sem cobrança de aluguel ainda"
                  description="Quando a locadora começar a cobrar o aluguel, a situação aparece aqui."
                />
              )}
            </Col>
            {statement && (
              <>
                <Col>
                  <PartnerAreaCyclesCard cycles={statement.cycles} />
                </Col>
                <Col>
                  <PartnerAreaPaymentsCard payments={statement.payments} />
                </Col>
              </>
            )}
          </Row>
        </Box>
      )}
    </Box>
  );
}

function PartnerRentalSkeleton() {
  return (
    <SkeletonRegion label="Carregando locação…" className="space-y-6">
      <Box className="flex items-center justify-between gap-3">
        <Skeleton shape="text" className="w-60 text-2xl" />
        <Skeleton shape="pill" className="h-5 w-14" />
      </Box>
      <Row className="gap-y-6">
        <Col lg={4}>
          <PartnerAreaRentalSummarySkeleton />
        </Col>
        <Col lg={8}>
          <PartnerAreaRentSituationSkeleton />
        </Col>
        <Col>
          <PartnerAreaCyclesCardSkeleton />
        </Col>
        <Col>
          <PartnerAreaPaymentsCardSkeleton />
        </Col>
      </Row>
    </SkeletonRegion>
  );
}
