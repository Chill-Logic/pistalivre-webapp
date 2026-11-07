import { CarFront } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { routeTo } from "@/constants/routes";
import { effectiveVehicleStatus, vehicleName } from "@/helpers/vehicle";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/utils/cn";
import { formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

const COLUMNS = [
  "Placa",
  "Veículo",
  "Tipo",
  "Categoria",
  "Ano",
  "Km",
  "Locatário",
  "Situação",
];

type VehicleTableProps = {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  skeletonCount?: number;
};

/** Table view of the vehicle list; the whole row opens the vehicle. */
export function VehicleTable({
  vehicles,
  isLoading,
  isRefreshing = false,
  skeletonCount = 8,
}: VehicleTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = { from: location.pathname + location.search };

  if (isLoading) return <VehicleTableSkeleton rows={skeletonCount} />;

  if (!vehicles?.length) {
    return (
      <EmptyState
        icon={CarFront}
        title="Nenhum veículo encontrado"
        description="Ajuste a busca ou os filtros."
      />
    );
  }

  return (
    <Table
      aria-busy={isRefreshing}
      className={cn(
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow
            key={vehicle.id}
            className="cursor-pointer"
            onClick={() =>
              navigate(routeTo.vehicle(vehicle.id), { state: from })
            }
          >
            <TableCell>
              <Link
                to={routeTo.vehicle(vehicle.id)}
                state={from}
                onClick={(event) => event.stopPropagation()}
                className="font-mono font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {formatPlate(vehicle.plate)}
              </Link>
            </TableCell>
            <TableCell className="max-w-64 truncate">
              {vehicleName(vehicle)}
            </TableCell>
            <TableCell>{vehicle.type.name}</TableCell>
            <TableCell>{vehicle.category.name}</TableCell>
            <TableCell>{vehicle.year}</TableCell>
            <TableCell>
              {vehicle.currentMileage !== null
                ? formatMileage(vehicle.currentMileage)
                : "—"}
            </TableCell>
            <TableCell className="max-w-56 truncate">
              {vehicle.activeRental ? (
                <Text inline size={null}>
                  {vehicle.activeRental.customer.name}
                </Text>
              ) : (
                <Text inline size={null} tone="muted">
                  —
                </Text>
              )}
            </TableCell>
            <TableCell>
              <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function VehicleTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <SkeletonRegion label="Carregando veículos…">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell>
                <Skeleton shape="text" className="w-20" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-48" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-12" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-16" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-10" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-16" />
              </TableCell>
              <TableCell>
                <Skeleton shape="text" className="w-32" />
              </TableCell>
              <TableCell>
                <Skeleton shape="pill" className="h-5 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SkeletonRegion>
  );
}
