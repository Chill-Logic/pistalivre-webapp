import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { serviceLines } from "@/helpers/maintenance";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MaintenanceListItem } from "@/types/maintenance";
import {
  formatCalendarDate,
  formatCurrency,
  formatMileage,
} from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function MaintenanceCard({
  maintenance,
}: {
  maintenance: MaintenanceListItem;
}) {
  const location = useLocation();
  const { label } = useLabels();
  const services = serviceLines(maintenance, label);
  const details = [
    maintenance.provider,
    maintenance.mileage !== null && formatMileage(maintenance.mileage),
    maintenance.rental?.code,
  ].filter(Boolean);

  return (
    <Link
      to={routeTo.maintenance(maintenance.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" mono>
              {formatPlate(maintenance.vehicle.plate)}
            </Text>
            <Badge variant="neutral">
              {label(LABEL_MAPS.maintenanceType, maintenance.type)}
            </Badge>
          </Box>
          <Text truncate>{maintenance.vehicle.label}</Text>
          <Box className="flex items-baseline justify-between gap-2">
            <Text size="xs" tone="muted">
              {formatCalendarDate(maintenance.performedAt)}
              {maintenance.registeredBy === "CUSTOMER" && " · pelo locatário"}
            </Text>
            <Text weight="semibold" className="tabular-nums">
              {maintenance.cost !== null
                ? formatCurrency(maintenance.cost)
                : "Sem valor"}
            </Text>
          </Box>
          {services.length > 0 && (
            <Text size="xs" tone="muted" truncate>
              {services.map((service) => service.text).join(" · ")}
            </Text>
          )}
          {details.length > 0 && (
            <Text size="xs" tone="muted" truncate>
              {details.join(" · ")}
            </Text>
          )}
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}

export function MaintenanceCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-24 text-base" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
        <Skeleton shape="text" className="w-3/4 text-sm" />
        <Box className="flex justify-between gap-2">
          <Skeleton shape="text" className="w-20 text-xs" />
          <Skeleton shape="text" className="w-16 text-sm" />
        </Box>
        <Skeleton shape="text" className="w-2/3 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
