import { FileSignature } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PartnerAreaRentalTable } from "@/components/organisms/partner-area-rental-table";
import { QueryError } from "@/components/organisms/query-error";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { visiblePeriodText } from "@/helpers/partner-area";
import { rateLabel } from "@/helpers/rental";
import { usePartnerRentals } from "@/hooks/api/parceiro/area/usePartnerRentals";
import { useLabels } from "@/hooks/ui/useLabels";
import { formatPlate } from "@/utils/plate";

/**
 * Every rental of the partner's vehicles, cut to the partner's window
 * (gathered from each vehicle: the API has no list of them). A table on
 * the desktop, cards on the phone. Short list: no paging.
 */
export function PartnerRentalsPage() {
  const query = usePartnerRentals();
  const { label } = useLabels();
  const empty = (
    <EmptyState
      icon={FileSignature}
      title="Nenhuma locação ainda"
      description="As locações dos seus veículos aparecem aqui, a partir de quando cada veículo entrou no seu contrato."
    />
  );

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Locações" />
      {query.isError ? (
        <QueryError error={query.error} onRetry={query.refetch} />
      ) : (
        <>
          <Box className="hidden md:block">
            <PartnerAreaRentalTable
              rentals={query.rentals}
              isLoading={query.isPending}
              isRefreshing={query.isRefetching}
              empty={empty}
            />
          </Box>
          <Box className="md:hidden">
            {query.isPending ? (
              <SkeletonRegion
                label="Carregando locações…"
                className="space-y-3"
              >
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    className="space-y-2 rounded-lg border bg-card px-4 py-3"
                  >
                    <Box className="flex items-start justify-between gap-3">
                      <Skeleton shape="text" className="w-40 text-sm" />
                      <Skeleton shape="pill" className="h-5 w-16" />
                    </Box>
                    <Skeleton shape="text" className="w-48 text-xs" />
                    <Skeleton shape="text" className="w-36 text-xs" />
                  </Box>
                ))}
              </SkeletonRegion>
            ) : query.rentals.length === 0 ? (
              empty
            ) : (
              <List
                className={
                  query.isRefetching
                    ? "space-y-3 opacity-60 transition-opacity"
                    : "space-y-3 transition-opacity"
                }
              >
                {query.rentals.map((rental) => (
                  <ListItem
                    key={rental.id}
                    className="rounded-lg border bg-card px-4"
                  >
                    <PartnerAreaListRow
                      to={routeTo.partnerAreaRental(rental.id)}
                      title={rental.customerName}
                      meta={[
                        `${rental.vehicleLabel} · ${formatPlate(rental.plate)}`,
                        visiblePeriodText(rental.visibleFrom, rental.visibleTo),
                        rateLabel(
                          rental.rate,
                          label(LABEL_MAPS.ratePeriod, rental.ratePeriod),
                        ),
                      ]}
                      aside={<RentalStatusBadge status={rental.status} />}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
