import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { routeTo } from "@/constants/routes";
import type { VehicleRankingItem } from "@/types/dashboard";
import {
  formatCalendarDate,
  formatCurrency,
  formatMileage,
} from "@/utils/format";
import { formatPlate } from "@/utils/plate";
import { pluralize } from "@/utils/text";

type VehicleMaintenanceRankingProps = {
  /** Vehicles with activity, highest spend first (order from the API). */
  vehicles: VehicleRankingItem[];
  /** How many vehicles were left out for having no activity at all. */
  idleCount: number;
};

export function VehicleMaintenanceRanking({
  vehicles,
  idleCount,
}: VehicleMaintenanceRankingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manutenção por veículo</CardTitle>
      </CardHeader>
      <CardContent className="px-0 md:px-0">
        {vehicles.length === 0 ? (
          <Text tone="muted" className="py-6 text-center">
            Nenhuma manutenção ou vistoria registrada.
          </Text>
        ) : (
          <List className="divide-y border-t">
            {vehicles.map((vehicle) => (
              <ListItem key={vehicle.vehicleId}>
                <Link
                  to={routeTo.vehicle(vehicle.vehicleId)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none md:px-6"
                >
                  <Box className="min-w-0 flex-1 space-y-2">
                    <Box className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Text weight="semibold" mono>
                        {formatPlate(vehicle.plate)}
                      </Text>
                      <Text truncate tone="muted" className="min-w-0 flex-1">
                        {vehicle.label}
                      </Text>
                      <VehicleStatusBadge status={vehicle.status} />
                    </Box>
                    <Row as="dl" className="gap-y-2">
                      <InfoItem span={6} md={3} label="Gasto">
                        {formatCurrency(vehicle.maintenanceCost)}
                      </InfoItem>
                      <InfoItem span={6} md={3} label="Manutenções · vistorias">
                        {vehicle.maintenanceCount} · {vehicle.inspectionCount}
                      </InfoItem>
                      <InfoItem span={6} md={3} label="Km atual">
                        {vehicle.currentKm != null
                          ? formatMileage(vehicle.currentKm)
                          : null}
                      </InfoItem>
                      <InfoItem span={6} md={3} label="Última manutenção">
                        {vehicle.lastMaintenance
                          ? formatCalendarDate(vehicle.lastMaintenance)
                          : null}
                      </InfoItem>
                    </Row>
                  </Box>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </ListItem>
            ))}
          </List>
        )}
        {idleCount > 0 && vehicles.length > 0 && (
          <Text size="xs" tone="muted" className="border-t px-4 pt-3 md:px-6">
            {pluralize(
              idleCount,
              "veículo sem manutenção nem vistoria fica fora da lista.",
              "veículos sem manutenção nem vistoria ficam fora da lista.",
            )}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

const SKELETON_ROWS = 4;

export function VehicleMaintenanceRankingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-48 text-base" />
      </CardHeader>
      <CardContent className="px-0 md:px-0">
        <Box className="divide-y border-t">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Box key={index} className="space-y-3 px-4 py-3 md:px-6">
              <Box className="flex items-center gap-3">
                <Skeleton shape="text" className="w-20 text-sm" />
                <Skeleton shape="text" className="w-40 text-sm" />
              </Box>
              <Box className="flex gap-6">
                <Skeleton shape="text" className="w-16 text-sm" />
                <Skeleton shape="text" className="w-16 text-sm" />
                <Skeleton shape="text" className="w-16 text-sm" />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
