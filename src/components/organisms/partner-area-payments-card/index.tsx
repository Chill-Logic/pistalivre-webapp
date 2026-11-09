import { Text } from "@/components/atoms/text";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import {
  PartnerAreaTableCard,
  PartnerAreaTableCardSkeleton,
  type PartnerAreaColumn,
} from "@/components/organisms/partner-area-table-card";
import { PARTNER_PAYMENT_KIND } from "@/constants/partner-area";
import type { PartnerAreaStatement } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type Payment = PartnerAreaStatement["payments"][number];

const COLUMNS: PartnerAreaColumn<Payment>[] = [
  { header: "Data", cell: (payment) => formatCalendarDate(payment.paidAt) },
  { header: "Tipo", cell: (payment) => PARTNER_PAYMENT_KIND[payment.kind] },
  {
    header: "Valor",
    align: "right",
    cell: (payment) => formatCurrency(payment.amount),
  },
];

/** What went into the rent in the partner's window, newest first. */
export function PartnerAreaPaymentsCard({
  payments,
}: {
  payments: Payment[];
}) {
  return (
    <PartnerAreaTableCard
      title="Pagamentos"
      empty="Nenhum pagamento no seu período."
      items={payments}
      rowKey={(payment, index) => `${payment.paidAt}-${payment.kind}-${index}`}
      columns={COLUMNS}
      renderItem={(payment) => (
        <PartnerAreaListRow
          title={formatCalendarDate(payment.paidAt)}
          meta={[PARTNER_PAYMENT_KIND[payment.kind]]}
          aside={
            <Text weight="semibold" className="tabular-nums">
              {formatCurrency(payment.amount)}
            </Text>
          }
        />
      )}
    />
  );
}

export function PartnerAreaPaymentsCardSkeleton() {
  return (
    <PartnerAreaTableCardSkeleton rows={2} columns={["w-20", "w-20", "w-20"]} />
  );
}
