import { Link } from "react-router-dom";
import { Text } from "@/components/atoms/text";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import {
  PartnerAreaTableCard,
  PartnerAreaTableCardSkeleton,
  type PartnerAreaColumn,
} from "@/components/organisms/partner-area-table-card";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { visiblePeriodText } from "@/helpers/partner-area";
import { rateLabel } from "@/helpers/rental";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaRental } from "@/types/partner-area";

const LINK_CLASS =
  "rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Rentals of the vehicle, cut to the partner's window (active and closed). */
export function PartnerAreaRentalsCard({
  rentals,
}: {
  rentals: PartnerAreaRental[];
}) {
  const { label } = useLabels();
  const rate = (rental: PartnerAreaRental) =>
    rateLabel(rental.rate, label(LABEL_MAPS.ratePeriod, rental.ratePeriod));

  const columns: PartnerAreaColumn<PartnerAreaRental>[] = [
    {
      header: "Cliente",
      wrap: true,
      cell: (rental) => (
        <>
          <Link
            to={routeTo.partnerAreaRental(rental.id)}
            className={LINK_CLASS}
          >
            {rental.customerName}
          </Link>
          <Text size="xs" tone="muted" mono>
            {rental.code}
          </Text>
        </>
      ),
    },
    {
      header: "Situação",
      cell: (rental) => <RentalStatusBadge status={rental.status} />,
    },
    {
      header: "No seu período",
      cell: (rental) => visiblePeriodText(rental.visibleFrom, rental.visibleTo),
    },
    { header: "Valor", align: "right", cell: rate },
  ];

  return (
    <PartnerAreaTableCard
      title="Locações"
      empty="Nenhuma locação enquanto o veículo está com você."
      items={rentals}
      rowKey={(rental) => rental.id}
      columns={columns}
      renderItem={(rental) => (
        <PartnerAreaListRow
          to={routeTo.partnerAreaRental(rental.id)}
          title={rental.customerName}
          meta={[
            visiblePeriodText(rental.visibleFrom, rental.visibleTo),
            rate(rental),
          ]}
          aside={<RentalStatusBadge status={rental.status} />}
        />
      )}
      footer="De cada locação aparece só o trecho em que o veículo estava no seu contrato."
    />
  );
}

export function PartnerAreaRentalsCardSkeleton() {
  return (
    <PartnerAreaTableCardSkeleton
      rows={2}
      columns={["w-40", "w-16", "w-36", "w-28"]}
    />
  );
}
