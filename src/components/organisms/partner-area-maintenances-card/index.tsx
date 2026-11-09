import { Text } from "@/components/atoms/text";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import {
  PartnerAreaTableCard,
  PartnerAreaTableCardSkeleton,
  type PartnerAreaColumn,
} from "@/components/organisms/partner-area-table-card";
import { LABEL_MAPS } from "@/constants/label-maps";
import { servicesText } from "@/helpers/partner-area";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaMaintenance } from "@/types/partner-area";
import {
  formatCalendarDate,
  formatCurrency,
  formatMileage,
} from "@/utils/format";

/** Maintenance done while the vehicle was the partner's. */
export function PartnerAreaMaintenancesCard({
  maintenances,
}: {
  maintenances: PartnerAreaMaintenance[];
}) {
  const { label } = useLabels();
  const mileage = (item: PartnerAreaMaintenance) =>
    item.mileage !== null ? formatMileage(item.mileage) : "—";

  const columns: PartnerAreaColumn<PartnerAreaMaintenance>[] = [
    { header: "Data", cell: (item) => formatCalendarDate(item.performedAt) },
    {
      header: "Tipo",
      cell: (item) => label(LABEL_MAPS.maintenanceType, item.type),
    },
    {
      header: "Serviços",
      wrap: true,
      cell: (item) => servicesText(item.services, label) || "—",
    },
    { header: "Km", align: "right", cell: mileage },
    {
      header: "Custo",
      align: "right",
      cell: (item) => (item.cost !== null ? formatCurrency(item.cost) : "—"),
    },
  ];

  return (
    <PartnerAreaTableCard
      title="Manutenções"
      empty="Nenhuma manutenção no período."
      items={maintenances}
      rowKey={(item) => item.id}
      columns={columns}
      renderItem={(item) => (
        <PartnerAreaListRow
          title={label(LABEL_MAPS.maintenanceType, item.type)}
          meta={[
            item.mileage !== null
              ? `${formatCalendarDate(item.performedAt)} · ${formatMileage(item.mileage)}`
              : formatCalendarDate(item.performedAt),
            servicesText(item.services, label),
          ]}
          aside={
            item.cost !== null && (
              <Text weight="semibold" className="tabular-nums">
                {formatCurrency(item.cost)}
              </Text>
            )
          }
        />
      )}
    />
  );
}

export function PartnerAreaMaintenancesCardSkeleton() {
  return (
    <PartnerAreaTableCardSkeleton
      rows={2}
      columns={["w-20", "w-20", "w-32", "w-16", "w-20"]}
    />
  );
}
