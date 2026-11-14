import { CarFront } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { TextLink } from "@/components/molecules/text-link";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import { effectiveVehicleStatus, vehicleName } from "@/helpers/vehicle";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

const COLUMNS: DataTableColumn<Vehicle>[] = [
  {
    header: "Placa",
    cell: (vehicle) => (
      <Text inline size={null} mono weight="semibold">
        {formatPlate(vehicle.plate)}
      </Text>
    ),
    skeleton: "w-20",
  },
  {
    header: "Veículo",
    cell: (vehicle) => (
      // The partner's badge goes under the name: side by side it squeezed
      // the vehicle's name down to "Honda CG 160…".
      <Box className="flex min-w-0 flex-col items-start gap-1">
        <Text inline size={null} truncate className="max-w-full">
          {vehicleName(vehicle)}
        </Text>
        {vehicle.owner && (
          <Badge
            variant="outline"
            className="max-w-full font-normal"
            title={`Parceiro: ${vehicle.owner.name}`}
          >
            Parceiro: {vehicle.owner.name}
          </Badge>
        )}
      </Box>
    ),
    className: "max-w-80",
    skeleton: "w-48",
  },
  { header: "Tipo", cell: (vehicle) => vehicle.type.name, skeleton: "w-12" },
  {
    header: "Categoria",
    cell: (vehicle) => vehicle.category.name,
    skeleton: "w-16",
  },
  { header: "Ano", cell: (vehicle) => vehicle.year, skeleton: "w-10" },
  {
    header: "Km",
    align: "right",
    cell: (vehicle) =>
      vehicle.currentMileage !== null
        ? formatMileage(vehicle.currentMileage)
        : "—",
    skeleton: "w-16",
  },
  {
    header: "Locatário",
    cell: (vehicle) =>
      vehicle.activeRental ? (
        <TextLink
          to={routeTo.rental(vehicle.activeRental.id)}
          // The row opens the vehicle; this opens the rental.
          onClick={(event) => event.stopPropagation()}
        >
          {vehicle.activeRental.customer.name}
        </TextLink>
      ) : (
        "—"
      ),
    className: "max-w-56 truncate",
    skeleton: "w-32",
  },
  {
    header: "Situação",
    cell: (vehicle) => (
      <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
    ),
    skeletonShape: "pill",
  },
];

type VehicleTableProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the vehicle list (same props as VehicleList). */
export function VehicleTable({
  vehicles,
  isLoading,
  isRefreshing,
}: VehicleTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      items={vehicles}
      rowKey={(vehicle) => vehicle.id}
      rowHref={(vehicle) => routeTo.vehicle(vehicle.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando veículos…"
      empty={
        <EmptyState
          icon={CarFront}
          title="Nenhum veículo encontrado"
          description="Ajuste a busca ou os filtros."
        />
      }
    />
  );
}
