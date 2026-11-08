import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { routeTo } from "@/constants/routes";
import { effectiveVehicleStatus, vehicleName } from "@/helpers/vehicle";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const location = useLocation();
  const details = [
    vehicle.type.name,
    vehicle.category.name,
    vehicle.year,
    vehicle.currentMileage !== null && formatMileage(vehicle.currentMileage),
  ].filter(Boolean);

  // The whole card opens the vehicle (stretched link); the renter is its own
  // link to the rental, above it (a link can't sit inside another).
  return (
    <Card className="relative flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Link
            to={routeTo.vehicle(vehicle.id)}
            state={{ from: location.pathname + location.search }}
            className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            <Text size="lg" weight="semibold" mono>
              {formatPlate(vehicle.plate)}
            </Text>
          </Link>
          <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
        </Box>
        <Text truncate>{vehicleName(vehicle)}</Text>
        <Text size="xs" tone="muted" truncate>
          {details.join(" · ")}
        </Text>
        {vehicle.activeRental && (
          <Text size="xs" tone="muted" truncate>
            Com{" "}
            <TextLink
              to={routeTo.rental(vehicle.activeRental.id)}
              className="relative z-10 text-xs"
            >
              {vehicle.activeRental.customer.name}
            </TextLink>{" "}
            · {vehicle.activeRental.code}
          </Text>
        )}
      </Box>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Card>
  );
}

/** Same box model as VehicleCard: plate + badge, name, details line. */
export function VehicleCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-28 text-lg" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
        <Skeleton shape="text" className="w-3/4 text-sm" />
        <Skeleton shape="text" className="w-1/2 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
