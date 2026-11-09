import type { ReactNode } from "react";
import { Text } from "@/components/atoms/text";
import { PartnerVehicleStatusBadge } from "@/components/molecules/partner-area-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import { periodText } from "@/helpers/partner-area";
import type { PartnerAreaVehicleRow } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

const COLUMNS: DataTableColumn<PartnerAreaVehicleRow>[] = [
  {
    header: "Placa",
    cell: (vehicle) => (
      <Text inline size={null} mono weight="semibold">
        {vehicle.plate ? formatPlate(vehicle.plate) : "—"}
      </Text>
    ),
    skeleton: "w-20",
  },
  {
    header: "Moto",
    cell: (vehicle) => vehicle.label ?? "Moto",
    className: "max-w-64 truncate",
    skeleton: "w-48",
  },
  {
    header: "Contrato",
    cell: (vehicle) => (
      <Text inline size="xs" tone="muted" mono>
        {vehicle.contractCode}
      </Text>
    ),
    skeleton: "w-24",
  },
  {
    header: "Situação",
    cell: (vehicle) => <PartnerVehicleStatusBadge status={vehicle.status} />,
    skeleton: "w-16",
    skeletonShape: "pill",
  },
  {
    header: "Aquisição",
    align: "right",
    cell: (vehicle) =>
      vehicle.acquisitionValue !== null
        ? formatCurrency(vehicle.acquisitionValue)
        : "—",
    skeleton: "ml-auto w-20",
  },
  {
    header: "No contrato",
    cell: (vehicle) => periodText(vehicle.joinedAt, vehicle.leftAt),
    className: "text-muted-foreground",
    skeleton: "w-28",
  },
  {
    header: "Locação atual",
    cell: (vehicle): ReactNode =>
      vehicle.currentRental ? (
        <>
          <TextLink
            to={routeTo.partnerAreaRental(vehicle.currentRental.id)}
            // The row opens the motorcycle; this opens the rental.
            onClick={(event) => event.stopPropagation()}
          >
            {vehicle.currentRental.customerName}
          </TextLink>
          <Text size="xs" tone="muted">
            Desde {formatCalendarDate(vehicle.currentRental.visibleFrom)}
          </Text>
        </>
      ) : (
        <Text inline tone="muted">
          Sem locação
        </Text>
      ),
    skeleton: "w-36",
  },
];

type PartnerAreaVehicleTableProps = {
  vehicles: PartnerAreaVehicleRow[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  empty: ReactNode;
};

/** The partner's motorcycles on the desktop: one row each, opens the motorcycle. */
export function PartnerAreaVehicleTable({
  vehicles,
  isLoading,
  isRefreshing,
  empty,
}: PartnerAreaVehicleTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      items={vehicles}
      rowKey={(vehicle) => vehicle.vehicleId}
      rowHref={(vehicle) => routeTo.partnerAreaVehicle(vehicle.vehicleId)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      empty={empty}
      loadingLabel="Carregando motos…"
      skeletonRows={3}
    />
  );
}
