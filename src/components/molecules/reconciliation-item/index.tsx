import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import type { ReconSuggestion, ReconTarget } from "@/types/reconciliation";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** What the pix would pay, in words ("Aluguel de R$ 400,00 · vence 02/11 · LOC-…"). */
function targetText(target: ReconTarget): string {
  if (target.kind === "receipt") {
    return `Pix recebido na diária ${target.rentalCode}${target.plate ? ` · ${target.plate}` : ""}`;
  }
  const due = target.dueDate ? ` · vence ${formatCalendarDate(target.dueDate)}` : "";
  const code = target.rentalCode ? ` · ${target.rentalCode}` : "";
  return `${target.label} de ${formatCurrency(target.chargeAmount)}${due}${code}`;
}

type ReconciliationItemProps = {
  suggestion: ReconSuggestion;
  /** Accept (the dialog) and dismiss buttons. */
  actions: ReactNode;
};

/** One suggestion: the pix (who, how much, when) → what it most likely pays. */
export function ReconciliationItem({ suggestion, actions }: ReconciliationItemProps) {
  const { credit, targets, confidence } = suggestion;
  const target = targets[0];
  const differs = target.kind === "settle" && !target.exact;
  return (
    <Box className="flex flex-col gap-3 py-3 md:flex-row md:items-center">
      <Box className="min-w-0 flex-1 space-y-1">
        <Box className="flex flex-wrap items-baseline gap-x-2">
          <Text weight="medium" className="tabular-nums">
            {formatCurrency(credit.amount)}
          </Text>
          <Text truncate>de {credit.payerName}</Text>
          <Text size="xs" tone="muted">
            {formatCalendarDate(credit.date)}
          </Text>
        </Box>
        <Box className="flex flex-wrap items-center gap-1.5">
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <Text size="xs" tone="muted" className="min-w-0">
            {targetText(target)}
          </Text>
          {confidence === "medium" && <Badge variant="warning">{differs ? "valor diferente" : "confira"}</Badge>}
          {targets.length > 1 && (
            <Text size="xs" tone="muted">
              · +{targets.length - 1} {targets.length - 1 === 1 ? "opção" : "opções"}
            </Text>
          )}
        </Box>
      </Box>
      <Box className="flex flex-wrap items-center gap-1.5 md:justify-end">{actions}</Box>
    </Box>
  );
}

export function ReconciliationItemSkeleton() {
  return (
    <Box className="flex items-center gap-3 py-3">
      <Box className="flex-1 space-y-2">
        <Skeleton shape="text" className="w-1/2 text-sm" />
        <Skeleton shape="text" className="w-2/3 text-xs" />
      </Box>
      <Skeleton className="h-8 w-28" />
    </Box>
  );
}
