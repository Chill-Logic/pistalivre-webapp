import { FileText } from "lucide-react";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { rateLabel } from "@/helpers/rental";
import { vehicleName } from "@/helpers/vehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type { RentalListItem } from "@/types/rental";
import { formatCalendarDate } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type RentalTableProps = {
  rentals: RentalListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the rental list (same props as RentalList). */
export function RentalTable({
  rentals,
  isLoading,
  isRefreshing,
}: RentalTableProps) {
  const { label } = useLabels();

  const columns: DataTableColumn<RentalListItem>[] = [
    {
      header: "Código",
      cell: (rental) => (
        <Text inline size={null} mono weight="semibold">
          {rental.code}
        </Text>
      ),
      skeleton: "w-28",
    },
    {
      header: "Locatário",
      cell: (rental) => rental.customer.name,
      className: "max-w-56 truncate",
      skeleton: "w-40",
    },
    {
      header: "Veículo",
      cell: (rental) =>
        `${formatPlate(rental.vehicle.plate)} · ${vehicleName(rental.vehicle)}`,
      className: "max-w-72 truncate",
      skeleton: "w-52",
    },
    {
      header: "Valor",
      cell: (rental) =>
        rateLabel(rental.rate, label(LABEL_MAPS.ratePeriod, rental.ratePeriod)),
      skeleton: "w-32",
    },
    {
      header: "Início",
      cell: (rental) => formatCalendarDate(rental.startDate),
      skeleton: "w-20",
    },
    {
      header: "Fim",
      cell: (rental) =>
        rental.endDate ? formatCalendarDate(rental.endDate) : "Sem prazo",
      skeleton: "w-20",
    },
    {
      header: "Situação",
      cell: (rental) => <RentalStatusBadge status={rental.status} />,
      skeletonShape: "pill",
    },
  ];

  return (
    <DataTable
      columns={columns}
      items={rentals}
      rowKey={(rental) => rental.id}
      rowHref={(rental) => routeTo.rental(rental.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando locações…"
      empty={
        <EmptyState
          icon={FileText}
          title="Nenhuma locação encontrada"
          description="Ajuste a busca ou os filtros."
        />
      }
    />
  );
}
