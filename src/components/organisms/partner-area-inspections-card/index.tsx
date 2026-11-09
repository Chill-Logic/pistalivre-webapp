import { Text } from "@/components/atoms/text";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import {
  PartnerAreaTableCard,
  PartnerAreaTableCardSkeleton,
  type PartnerAreaColumn,
} from "@/components/organisms/partner-area-table-card";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaInspection } from "@/types/partner-area";
import { formatDate, formatMileage } from "@/utils/format";

/** Inspections done while the vehicle was the partner's. */
export function PartnerAreaInspectionsCard({
  inspections,
}: {
  inspections: PartnerAreaInspection[];
}) {
  const { label } = useLabels();

  // Short rows (date, type, km): a small dense table beside the maintenance.
  const columns: PartnerAreaColumn<PartnerAreaInspection>[] = [
    { header: "Data", cell: (item) => formatDate(item.createdAt) },
    {
      header: "Tipo",
      cell: (item) => label(LABEL_MAPS.inspectionType, item.type),
    },
    {
      header: "Km",
      align: "right",
      cell: (item) =>
        item.mileage !== null ? formatMileage(item.mileage) : "—",
    },
  ];

  return (
    <PartnerAreaTableCard
      title="Vistorias"
      empty="Nenhuma vistoria no período."
      items={inspections}
      rowKey={(item) => item.id}
      columns={columns}
      narrowFromXl
      renderItem={(item) => (
        <PartnerAreaListRow
          title={label(LABEL_MAPS.inspectionType, item.type)}
          meta={[formatDate(item.createdAt)]}
          aside={
            item.mileage !== null && (
              <Text tone="muted" className="tabular-nums">
                {formatMileage(item.mileage)}
              </Text>
            )
          }
        />
      )}
    />
  );
}

export function PartnerAreaInspectionsCardSkeleton() {
  return (
    <PartnerAreaTableCardSkeleton
      rows={2}
      columns={["w-24", "w-20", "w-14"]}
      narrowFromXl
    />
  );
}
