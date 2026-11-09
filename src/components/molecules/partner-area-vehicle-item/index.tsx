import { ChevronRight, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { PartnerVehicleStatusBadge } from "@/components/molecules/partner-area-status-badge";
import { routeTo } from "@/constants/routes";
import { offerRateText } from "@/helpers/partner";
import { inContractText } from "@/helpers/partner-area";
import type { PartnerAreaContractVehicle } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

const LINK =
  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

/**
 * A vehicle of the contract, on the phone: the vehicle opens its page;
 * the current rental (renter's name and since when) opens the rental.
 */
export function PartnerAreaVehicleItem({
  vehicle,
}: {
  vehicle: PartnerAreaContractVehicle;
}) {
  const rental = vehicle.currentRental;
  const offer = offerRateText(vehicle.offerRate, vehicle.offerRatePeriod);
  return (
    <Box className="overflow-hidden rounded-lg border bg-card">
      <Link to={routeTo.partnerAreaVehicle(vehicle.vehicleId)} className={LINK}>
        <Box className="min-w-0 flex-1 space-y-1.5">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0">
              {vehicle.label ?? "Veículo"}
            </Text>
            <PartnerVehicleStatusBadge status={vehicle.status} />
          </Box>
          <Text size="xs" tone="muted">
            {vehicle.plate ? formatPlate(vehicle.plate) : "Sem placa"}
            {vehicle.acquisitionValue !== null &&
              ` · Aquisição ${formatCurrency(vehicle.acquisitionValue)}`}
          </Text>
          {offer && (
            <Text size="sm" className="tabular-nums">
              <Text inline size={null} tone="muted">
                Locação oferecida{" "}
              </Text>
              <Text
                inline
                size={null}
                weight="semibold"
                className="whitespace-nowrap"
              >
                {offer}
              </Text>
            </Text>
          )}
          <Text size="xs" tone="muted">
            {inContractText(vehicle.joinedAt, vehicle.leftAt)}
          </Text>
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
      {rental && (
        <Link
          to={routeTo.partnerAreaRental(rental.id)}
          className={`${LINK} border-t bg-muted/30`}
        >
          <KeyRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Box className="min-w-0 flex-1">
            <Text size="xs" tone="muted">
              Locação atual · desde {formatCalendarDate(rental.visibleFrom)}
            </Text>
            <Text weight="medium" truncate>
              {rental.customerName}
            </Text>
          </Box>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Link>
      )}
    </Box>
  );
}

export function PartnerAreaVehicleItemSkeleton() {
  return (
    <Box className="overflow-hidden rounded-lg border bg-card">
      <Box className="space-y-2 px-4 py-3">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-44 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
        <Skeleton shape="text" className="w-48 text-xs" />
        <Skeleton shape="text" className="w-52 text-sm" />
        <Skeleton shape="text" className="w-40 text-xs" />
      </Box>
      <Box className="space-y-1.5 border-t px-4 py-3">
        <Skeleton shape="text" className="w-36 text-xs" />
        <Skeleton shape="text" className="w-44 text-sm" />
      </Box>
    </Box>
  );
}
