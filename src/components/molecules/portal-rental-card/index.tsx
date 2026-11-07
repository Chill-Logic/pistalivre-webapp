import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { rateLabel } from "@/helpers/rental";
import { vehicleName } from "@/helpers/vehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalRental } from "@/types/portal";
import { formatCalendarDate } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

/** The renter's own rental: vehicle first (it's what they recognize). */
export function PortalRentalCard({ rental }: { rental: PortalRental }) {
  const { label } = useLabels();
  const period = label(LABEL_MAPS.ratePeriod, rental.ratePeriod);
  const dates = rental.endDate
    ? `${formatCalendarDate(rental.startDate)} a ${formatCalendarDate(rental.endDate)}`
    : `Desde ${formatCalendarDate(rental.startDate)}`;

  return (
    <Link
      to={routeTo.portalRental(rental.id)}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" truncate>
              {vehicleName(rental.vehicle)}
            </Text>
            <RentalStatusBadge status={rental.status} />
          </Box>
          <Text size="xs" tone="muted" truncate>
            {formatPlate(rental.vehicle.plate)} · {rental.code}
          </Text>
          <Text size="xs" tone="muted" truncate>
            {rateLabel(rental.rate, period)} · {dates}
          </Text>
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}

export function PortalRentalCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-40 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
        <Skeleton shape="text" className="w-1/2 text-xs" />
        <Skeleton shape="text" className="w-2/3 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
