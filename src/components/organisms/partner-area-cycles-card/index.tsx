import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { PartnerAreaListRow } from "@/components/molecules/partner-area-list-row";
import { PartnerCycleStateBadge } from "@/components/molecules/partner-area-status-badge";
import {
  PartnerAreaTableCard,
  PartnerAreaTableCardSkeleton,
  type PartnerAreaColumn,
} from "@/components/organisms/partner-area-table-card";
import { cycleRangeText } from "@/helpers/partner-area";
import type { PartnerAreaCycle } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

const COLUMNS: PartnerAreaColumn<PartnerAreaCycle>[] = [
  { header: "Vigência", cell: (cycle) => cycleRangeText(cycle.start, cycle.end) },
  { header: "Vencimento", cell: (cycle) => formatCalendarDate(cycle.due) },
  {
    header: "Valor",
    align: "right",
    cell: (cycle) => formatCurrency(cycle.amount),
  },
  { header: "Pago", align: "right", cell: (cycle) => formatCurrency(cycle.paid) },
  {
    header: "Falta",
    align: "right",
    cell: (cycle) =>
      cycle.missing > 0 ? (
        <Text inline tone="destructive" weight="medium">
          {formatCurrency(cycle.missing)}
        </Text>
      ) : (
        "—"
      ),
  },
  {
    header: "Situação",
    cell: (cycle) => (
      <Box className="flex items-center gap-2">
        <PartnerCycleStateBadge state={cycle.state} />
        {cycle.paidLate && (
          <Text inline size="xs" tone="muted">
            com atraso
          </Text>
        )}
      </Box>
    ),
  },
];

/** Each cycle of the rent in the partner's window, newest first (server math). */
export function PartnerAreaCyclesCard({
  cycles,
}: {
  cycles: PartnerAreaCycle[];
}) {
  return (
    <PartnerAreaTableCard
      title="Vencimentos"
      empty="Nenhum vencimento no seu período."
      items={cycles}
      rowKey={(cycle) => cycle.start}
      columns={COLUMNS}
      renderItem={(cycle) => (
        <PartnerAreaListRow
          title={cycleRangeText(cycle.start, cycle.end)}
          meta={[
            `Vence ${formatCalendarDate(cycle.due)} · ${formatCurrency(cycle.amount)}`,
            cycle.paid > 0 &&
              `Pago ${formatCurrency(cycle.paid)}${cycle.paidLate ? " (com atraso)" : ""}`,
          ]}
          aside={
            <>
              <PartnerCycleStateBadge state={cycle.state} />
              {cycle.missing > 0 && (
                <Text size="xs" tone="destructive" weight="medium">
                  Falta {formatCurrency(cycle.missing)}
                </Text>
              )}
            </>
          }
        />
      )}
    />
  );
}

export function PartnerAreaCyclesCardSkeleton() {
  return (
    <PartnerAreaTableCardSkeleton
      rows={4}
      columns={["w-36", "w-20", "w-20", "w-20", "w-16", "w-20"]}
    />
  );
}
