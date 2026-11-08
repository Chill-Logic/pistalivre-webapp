import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";

/** Kind of the vehicle document that is the CRLV. */
const CRLV_SLUG = "crlv";

/**
 * The CRLV of the rental's vehicle (it lives on the vehicle), to view or
 * send without leaving the rental. Sending a new one is on the vehicle.
 */
export function VehicleCrlvCard({ vehicleId }: { vehicleId: string }) {
  const vehicle = useVehicle(vehicleId);
  const { view, download } = useFileActions();
  const documents =
    vehicle.data?.documents.filter(
      (document) => document.category?.slug === CRLV_SLUG,
    ) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">CRLV do veículo</CardTitle>
      </CardHeader>
      <CardContent>
        {vehicle.isPending && (
          <SkeletonRegion label="Carregando CRLV…">
            <VehicleCrlvRowSkeleton />
          </SkeletonRegion>
        )}
        {vehicle.isError && (
          <QueryError error={vehicle.error} onRetry={() => vehicle.refetch()} />
        )}
        {vehicle.data && documents.length === 0 && (
          <Text tone="muted">
            CRLV não cadastrado no{" "}
            <TextLink to={routeTo.vehicle(vehicleId)}>veículo</TextLink>.
          </Text>
        )}
        {documents.length > 0 && (
          <Box className="divide-y">
            {documents.map((document) => (
              <DocumentItem
                key={document.id}
                document={document}
                onView={() => view.mutate(document)}
                onDownload={() => download.mutate(document)}
                isViewing={view.isPending && view.variables?.id === document.id}
                isDownloading={
                  download.isPending && download.variables?.id === document.id
                }
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function VehicleCrlvRowSkeleton() {
  return (
    <Box className="flex items-center gap-3 py-3">
      <Skeleton className="size-5 shrink-0" />
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-1/2 text-sm" />
        <Skeleton shape="text" className="w-1/3 text-xs" />
      </Box>
      <Skeleton className="size-9 shrink-0" />
      <Skeleton className="size-9 shrink-0" />
    </Box>
  );
}

export function VehicleCrlvCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-36 text-base" />
      </CardHeader>
      <CardContent>
        <VehicleCrlvRowSkeleton />
      </CardContent>
    </Card>
  );
}
