import { Copy, ExternalLink as ExternalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { chargeSituation, chargeSituationBadge } from "@/helpers/charge";
import { useCopy } from "@/hooks/ui/useCopy";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Charge } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * One charge. The amount shown is `amounts.amount` from the API (due today
 * with fine/interest, or what was paid) — never recomputed here.
 */
export function ChargeItem({
  charge,
  actions,
}: {
  charge: Charge;
  /** Staff buttons (settle, edit…); none on read-only lists. */
  actions?: ReactNode;
}) {
  const { label } = useLabels();
  const copy = useCopy();
  const situation = chargeSituation(charge);
  const badge = chargeSituationBadge(situation);
  const { amounts } = charge;
  const pixToCopy = !amounts.isPaid ? charge.pix?.payload : undefined;

  const title =
    charge.label ?? label(LABEL_MAPS.paymentPurpose, charge.purpose);
  const details = [
    label(LABEL_MAPS.paymentMethod, charge.method),
    `vence ${formatCalendarDate(charge.dueDate)}`,
    charge.referenceDate &&
      `referente a ${formatCalendarDate(charge.referenceDate)}`,
    charge.channel === "manual" && "fora do Asaas",
    charge.settledByReceipt && "baixa pelos pix recebidos",
  ].filter(Boolean);

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" truncate>
            {title}
          </Text>
          <Text size="xs" tone="muted">
            {details.join(" · ")}
          </Text>
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          <Text size="base" weight="semibold">
            {formatCurrency(amounts.amount)}
          </Text>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </Box>
      </Box>
      {!amounts.isPaid && amounts.surcharge > 0 && (
        <Text size="xs" tone="muted">
          {formatCurrency(amounts.principal)} +{" "}
          {formatCurrency(amounts.surcharge)} de multa e juros
        </Text>
      )}
      {amounts.isPaid && charge.paidAt && (
        <Text size="xs" tone="muted">
          Pago em {formatCalendarDate(charge.paidAt)}
          {amounts.shortfall > 0 &&
            ` · falta ${formatCurrency(amounts.shortfall)}`}
        </Text>
      )}
      {(charge.invoiceUrl || pixToCopy) && (
        <Box className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {pixToCopy && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(pixToCopy, "Pix copiado")}
            >
              <Copy />
              Copiar pix
            </Button>
          )}
          {charge.invoiceUrl && (
            <ExternalLink href={charge.invoiceUrl}>
              Abrir fatura
              <ExternalIcon className="size-3.5" aria-hidden />
            </ExternalLink>
          )}
        </Box>
      )}
      {actions && <Box className="flex flex-wrap gap-1">{actions}</Box>}
    </Box>
  );
}

export function ChargeItemSkeleton() {
  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0 flex-1 space-y-2">
          <Skeleton shape="text" className="w-28 text-sm" />
          <Skeleton shape="text" className="w-48 text-xs" />
        </Box>
        <Box className="flex shrink-0 flex-col items-end space-y-2">
          <Skeleton shape="text" className="w-24 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </Box>
    </Box>
  );
}
