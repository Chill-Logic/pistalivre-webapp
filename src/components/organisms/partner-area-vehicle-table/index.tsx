import type { ReactNode } from "react";
import { Text } from "@/components/atoms/text";
import { PartnerVehicleStatusBadge } from "@/components/molecules/partner-area-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import { offerRateText } from "@/helpers/partner";
import { periodText } from "@/helpers/partner-area";
import type { PartnerAreaVehicleRow } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

const COLUMNS: DataTableColumn<PartnerAreaVehicleRow>[] = [
  {
    // Plate under the name: one column less, room for the offered rent.
    header: "Veículo",
    cell: (vehicle) => (
      <>
        <Text inline size={null} weight="medium">
          {vehicle.label ?? "Veículo"}
        </Text>
        <Text size="xs" tone="muted" mono>
          {vehicle.plate ? formatPlate(vehicle.plate) : "—"}
        </Text>
      </>
    ),
    className: "max-w-64 whitespace-normal",
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
    header: "Locação oferecida",
    align: "right",
    cell: (vehicle) =>
      offerRateText(vehicle.offerRate, vehicle.offerRatePeriod) ?? "—",
    skeleton: "ml-auto w-28",
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
            // The row opens the vehicle; this opens the rental.
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

/** The partner's vehicles on the desktop: one row each, opens the vehicle. */
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
      loadingLabel="Carregando veículos…"
      skeletonRows={3}
    />
  );
}
