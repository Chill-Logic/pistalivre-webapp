import { Car } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import {
  PartnerAreaVehicleItem,
  PartnerAreaVehicleItemSkeleton,
} from "@/components/molecules/partner-area-vehicle-item";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PartnerAreaVehicleTable } from "@/components/organisms/partner-area-vehicle-table";
import { QueryError } from "@/components/organisms/query-error";
import { partnerVehicleRows } from "@/helpers/partner-area";
import { usePartnerHome } from "@/hooks/api/parceiro/area/usePartnerHome";

/**
 * Every vehicle of the partner's contracts (from GET /partner): a table
 * on the desktop, cards on the phone. Short list: no paging.
 */
export function PartnerVehiclesPage() {
  const home = usePartnerHome();
  const vehicles = home.data ? partnerVehicleRows(home.data.contracts) : [];
  const empty = (
    <EmptyState
      icon={Car}
      title="Nenhum veículo ainda"
      description="Quando a locadora colocar um veículo no seu contrato, ele aparece aqui."
    />
  );

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Veículos" />
      {home.isError ? (
        <QueryError error={home.error} onRetry={() => home.refetch()} />
      ) : (
        <>
          <Box className="hidden md:block">
            <PartnerAreaVehicleTable
              vehicles={home.data && vehicles}
              isLoading={home.isPending}
              isRefreshing={home.isRefetching}
              empty={empty}
            />
          </Box>
          <Box className="md:hidden">
            {home.isPending ? (
              <SkeletonRegion
                label="Carregando veículos…"
                className="space-y-3"
              >
                <PartnerAreaVehicleItemSkeleton />
                <PartnerAreaVehicleItemSkeleton />
              </SkeletonRegion>
            ) : vehicles.length === 0 ? (
              empty
            ) : (
              <List
                className={
                  home.isRefetching
                    ? "space-y-3 opacity-60 transition-opacity"
                    : "space-y-3 transition-opacity"
                }
              >
                {vehicles.map((vehicle) => (
                  <ListItem key={vehicle.vehicleId}>
                    <PartnerAreaVehicleItem vehicle={vehicle} />
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
