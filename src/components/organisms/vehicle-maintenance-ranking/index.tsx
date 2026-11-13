import { Link } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Meter } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
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

/** A rented vehicle nobody inspected is the thing to look at, not a neutral zero. */
const missingInspection = (v: VehicleRankingItem) =>
  v.inspectionCount === 0 && v.status === "RENTED";

const dash = <Text inline tone="muted">—</Text>;

function columns(maxCost: number): DataTableColumn<VehicleRankingItem>[] {
  return [
    {
      header: "Veículo",
      skeleton: "w-32",
      cell: (v) => (
        <Box className="flex items-baseline gap-2">
          <Text inline weight="semibold" mono>
            {formatPlate(v.plate)}
          </Text>
          <Text inline tone="muted" className="font-normal">
            {v.label}
          </Text>
        </Box>
      ),
    },
    {
      header: "Situação",
      skeletonShape: "pill",
      cell: (v) => <VehicleStatusBadge status={v.status} />,
    },
    {
      header: "Gasto",
      align: "right",
      skeleton: "ml-auto w-20",
      className: "w-44",
      cell: (v) => (
        <Box className="space-y-1">
          <Text inline>{formatCurrency(v.maintenanceCost)}</Text>
          {maxCost > 0 && (
            <Meter value={v.maintenanceCost / maxCost} className="ml-auto h-1 w-28" />
          )}
        </Box>
      ),
    },
    {
      header: "Manutenções",
      align: "right",
      skeleton: "ml-auto w-8",
      cell: (v) => (v.maintenanceCount ? v.maintenanceCount : dash),
    },
    {
      header: "Vistorias",
      align: "right",
      skeleton: "ml-auto w-8",
      cell: (v) =>
        missingInspection(v) ? (
          <Badge variant="warning">nenhuma</Badge>
        ) : v.inspectionCount ? (
          v.inspectionCount
        ) : (
          dash
        ),
    },
    {
      header: "Km atual",
      align: "right",
      skeleton: "ml-auto w-16",
      cell: (v) => (v.currentKm != null ? formatMileage(v.currentKm) : dash),
    },
    {
      header: "Última manutenção",
      align: "right",
      skeleton: "ml-auto w-20",
      cell: (v) =>
        v.lastMaintenance ? formatCalendarDate(v.lastMaintenance) : dash,
    },
  ];
}

/**
 * Maintenance per vehicle: a dense table on desktop (one line per vehicle,
 * numbers aligned, the spend with a bar to compare at a glance) and compact
 * lines on the phone. A rented vehicle never inspected is flagged.
 */
export function VehicleMaintenanceRanking({
  vehicles,
  idleCount,
}: VehicleMaintenanceRankingProps) {
  const maxCost = Math.max(0, ...vehicles.map((v) => v.maintenanceCost));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manutenção por veículo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vehicles.length === 0 ? (
          <Text tone="muted" className="py-6 text-center">
            Nenhuma manutenção ou vistoria registrada.
          </Text>
        ) : (
          <>
            <Box className="hidden md:block">
              <DataTable
                columns={columns(maxCost)}
                items={vehicles}
                rowKey={(v) => v.vehicleId}
                rowHref={(v) => routeTo.vehicle(v.vehicleId)}
                isLoading={false}
                empty={null}
                loadingLabel="Carregando veículos…"
              />
            </Box>
            <List className="-mx-4 divide-y border-y md:hidden">
              {vehicles.map((v) => (
                <ListItem key={v.vehicleId}>
                  <Link
                    to={routeTo.vehicle(v.vehicleId)}
                    className="block space-y-1 px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                  >
                    <Box className="flex items-center gap-2">
                      <Text weight="semibold" mono>
                        {formatPlate(v.plate)}
                      </Text>
                      <VehicleStatusBadge status={v.status} />
                      <Text weight="medium" className="ml-auto tabular-nums">
                        {formatCurrency(v.maintenanceCost)}
                      </Text>
                    </Box>
                    <Text size="xs" tone="muted" truncate>
                      {v.label}
                    </Text>
                    <Box className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Text size="xs" tone="muted" className="tabular-nums">
                        {pluralize(v.maintenanceCount, "manutenção", "manutenções")}
                        {v.currentKm != null && ` · ${formatMileage(v.currentKm)}`}
                        {v.lastMaintenance && ` · última ${formatCalendarDate(v.lastMaintenance)}`}
                      </Text>
                      {missingInspection(v) ? (
                        <Badge variant="warning">sem vistoria</Badge>
                      ) : (
                        <Text size="xs" tone="muted">
                          · {pluralize(v.inspectionCount, "vistoria", "vistorias")}
                        </Text>
                      )}
                    </Box>
                  </Link>
                </ListItem>
              ))}
            </List>
          </>
        )}
        {idleCount > 0 && vehicles.length > 0 && (
          <Text size="xs" tone="muted">
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
      <CardContent>
        <Box className="hidden md:block">
          <DataTable
            columns={columns(0)}
            items={undefined}
            rowKey={(v) => v.vehicleId}
            rowHref={() => ""}
            isLoading
            empty={null}
            loadingLabel="Carregando veículos…"
            skeletonRows={SKELETON_ROWS}
          />
        </Box>
        <Box className="-mx-4 divide-y border-y md:hidden">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Box key={index} className="space-y-2 px-4 py-3">
              <Box className="flex items-center gap-2">
                <Skeleton shape="text" className="w-20 text-sm" />
                <Skeleton shape="pill" className="h-5 w-16" />
                <Skeleton shape="text" className="ml-auto w-16 text-sm" />
              </Box>
              <Skeleton shape="text" className="w-32 text-xs" />
              <Skeleton shape="text" className="w-48 text-xs" />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
