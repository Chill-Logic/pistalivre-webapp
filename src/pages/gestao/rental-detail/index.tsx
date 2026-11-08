import { CalendarRange, Eye, FileText, Link2, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { RentalDeleteButton } from "@/components/organisms/rental-delete-button";
import {
  RentalStatusCard,
  RentalStatusCardSkeleton,
} from "@/components/organisms/rental-status-card";
import { QueryError } from "@/components/organisms/query-error";
import {
  RentalBillingCard,
  RentalBillingCardSkeleton,
} from "@/components/organisms/rental-billing-card";
import {
  RentalCautionCard,
  RentalCautionCardSkeleton,
} from "@/components/organisms/rental-caution-card";
import {
  RentalCharges,
  RentalChargesSkeleton,
} from "@/components/organisms/rental-charges";
import {
  RentalSummary,
  RentalSummarySkeleton,
} from "@/components/organisms/rental-summary";
import {
  RelatedInspections,
  RelatedInspectionsSkeleton,
} from "@/components/organisms/related-inspections";
import {
  RelatedMaintenances,
  RelatedMaintenancesSkeleton,
} from "@/components/organisms/related-maintenances";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import {
  RateSegmentsCard,
  RateSegmentsCardSkeleton,
} from "@/components/organisms/rate-segments-card";
import {
  RentalAutoBillingCard,
  RentalAutoBillingCardSkeleton,
} from "@/components/organisms/rental-auto-billing-card";
import {
  RentReceiptsCard,
  RentReceiptsCardSkeleton,
} from "@/components/organisms/rent-receipts-card";
import {
  RentReconciliationCard,
  RentReconciliationCardSkeleton,
} from "@/components/organisms/rent-reconciliation-card";
import {
  RentalInvoicesCard,
  RentalInvoicesCardSkeleton,
} from "@/components/organisms/rental-invoices-card";
import {
  VehicleCrlvCard,
  VehicleCrlvCardSkeleton,
} from "@/components/organisms/vehicle-crlv-card";
import {
  OwnerSignatures,
  OwnerSignaturesSkeleton,
} from "@/components/organisms/owner-signatures";
import {
  RentalContractsCard,
  RentalContractsCardSkeleton,
} from "@/components/organisms/rental-contracts-card";
import { RentalDetailLayout } from "@/components/templates/rental-detail-layout";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { portalRentalUrl } from "@/helpers/host-realm";
import { splitRentalDocuments } from "@/helpers/contract";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useBackToList } from "@/hooks/ui/useBackToList";
import { useCopy } from "@/hooks/ui/useCopy";

export function RentalDetailPage() {
  const { id = "" } = useParams();
  const rental = useRental(id);
  const backTo = useBackToList(ROUTES.rentals);
  const copy = useCopy();

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Locações" />
        {rental.data && (
          <Box className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copy(portalRentalUrl(rental.data.id), "Link do cliente copiado")
              }
            >
              <Link2 />
              Link do cliente
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.rentalStatement(rental.data.id)}>
                <CalendarRange />
                Extrato
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.rentalCustomerView(rental.data.id)}>
                <Eye />
                Ver como cliente
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editRental(rental.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <RentalDeleteButton
              rentalId={rental.data.id}
              code={rental.data.code}
              isActive={rental.data.status === "ACTIVE"}
            />
          </Box>
        )}
      </Box>
      {rental.isPending && (
        <SkeletonRegion label="Carregando locação…">
          <RentalDetailLayout
            summary={<RentalSummarySkeleton />}
            status={<RentalStatusCardSkeleton />}
            billing={<RentalBillingCardSkeleton />}
            charges={<RentalChargesSkeleton />}
            caution={<RentalCautionCardSkeleton />}
            maintenances={<RelatedMaintenancesSkeleton />}
            inspections={<RelatedInspectionsSkeleton />}
            documents={<DocumentsCardSkeleton />}
            contracts={<RentalContractsCardSkeleton />}
            autoBilling={<RentalAutoBillingCardSkeleton />}
            reconciliation={<RentReconciliationCardSkeleton />}
            rateSegments={<RateSegmentsCardSkeleton />}
            receipts={<RentReceiptsCardSkeleton />}
            invoices={<RentalInvoicesCardSkeleton />}
            vehicleCrlv={<VehicleCrlvCardSkeleton />}
            signatures={<OwnerSignaturesSkeleton />}
          />
        </SkeletonRegion>
      )}
      {rental.isError &&
        (isNotFound(rental.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError error={rental.error} onRetry={() => rental.refetch()} />
        ))}
      {rental.data && (
        <RentalDetailLayout
          summary={<RentalSummary rental={rental.data} />}
          status={<RentalStatusCard rental={rental.data} />}
          billing={<RentalBillingCard rental={rental.data} />}
          charges={
            <RentalCharges
              rentalId={rental.data.id}
              rate={rental.data.rate}
              ratePeriod={rental.data.ratePeriod}
            />
          }
          caution={<RentalCautionCard caution={rental.data.caution} />}
          maintenances={<RelatedMaintenances rentalId={rental.data.id} />}
          inspections={
            <RelatedInspections
              rentalId={rental.data.id}
              rentalVehicleId={rental.data.vehicle.id}
            />
          }
          signatures={
            <OwnerSignatures ownerType="RENTAL" ownerId={rental.data.id} />
          }
          documents={
            <DocumentsCard
              documents={
                // Contracts have their own card ("Contratos").
                splitRentalDocuments(rental.data.documents, []).otherDocuments
              }
              manage={{
                owner: { type: "RENTAL", id: rental.data.id },
                invalidate: queryKeys.rentals.detail(rental.data.id),
              }}
            />
          }
          contracts={<RentalContractsCard rental={rental.data} />}
          autoBilling={<RentalAutoBillingCard rentalId={rental.data.id} />}
          reconciliation={<RentReconciliationCard rentalId={rental.data.id} />}
          rateSegments={<RateSegmentsCard rentalId={rental.data.id} />}
          receipts={<RentReceiptsCard rentalId={rental.data.id} />}
          invoices={<RentalInvoicesCard rentalId={rental.data.id} />}
          vehicleCrlv={<VehicleCrlvCard vehicleId={rental.data.vehicle.id} />}
        />
      )}
    </Box>
  );
}
