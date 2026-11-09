import type { ReactNode } from "react";
import { Text } from "@/components/atoms/text";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { visiblePeriodText } from "@/helpers/partner-area";
import { rateLabel } from "@/helpers/rental";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaRentalRow } from "@/types/partner-area";
import { formatPlate } from "@/utils/plate";

type PartnerAreaRentalTableProps = {
  rentals: PartnerAreaRentalRow[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  empty: ReactNode;
};

/** Every rental of the partner's vehicles on the desktop (opens the rental). */
export function PartnerAreaRentalTable({
  rentals,
  isLoading,
  isRefreshing,
  empty,
}: PartnerAreaRentalTableProps) {
  const { label } = useLabels();

  const columns: DataTableColumn<PartnerAreaRentalRow>[] = [
    {
      header: "Cliente",
      cell: (rental) => rental.customerName,
      className: "max-w-56 truncate",
      skeleton: "w-40",
    },
    {
      header: "Código",
      cell: (rental) => (
        <Text inline size="xs" tone="muted" mono>
          {rental.code}
        </Text>
      ),
      skeleton: "w-24",
    },
    {
      header: "Veículo",
      cell: (rental) => (
        <>
          <TextLink
            to={routeTo.partnerAreaVehicle(rental.vehicleId)}
            // The row opens the rental; this opens the vehicle.
            onClick={(event) => event.stopPropagation()}
          >
            {rental.vehicleLabel}
          </TextLink>
          <Text size="xs" tone="muted" mono>
            {formatPlate(rental.plate)}
          </Text>
        </>
      ),
      skeleton: "w-44",
    },
    {
      header: "Situação",
      cell: (rental) => <RentalStatusBadge status={rental.status} />,
      skeleton: "w-16",
      skeletonShape: "pill",
    },
    {
      header: "No seu período",
      cell: (rental) => visiblePeriodText(rental.visibleFrom, rental.visibleTo),
      className: "text-muted-foreground",
      skeleton: "w-36",
    },
    {
      header: "Valor",
      align: "right",
      cell: (rental) =>
        rateLabel(rental.rate, label(LABEL_MAPS.ratePeriod, rental.ratePeriod)),
      skeleton: "ml-auto w-28",
    },
  ];

  return (
    <DataTable
      columns={columns}
      items={rentals}
      rowKey={(rental) => rental.id}
      rowHref={(rental) => routeTo.partnerAreaRental(rental.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      empty={empty}
      loadingLabel="Carregando locações…"
      skeletonRows={4}
    />
  );
}
