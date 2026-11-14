import { Copy, ExternalLink as ExternalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { OptionsMenu } from "@/components/molecules/options-menu";
import { PixQrDialog } from "@/components/molecules/pix-qr-dialog";
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
  attach,
  attachments,
  meta,
}: {
  charge: Charge;
  /** Staff buttons (settle, edit…), in the "Opções" menu. */
  actions?: ReactNode;
  /** "Anexar comprovante", in the "Opções" menu. */
  attach?: ReactNode;
  /** Receipts already attached, under the amount lines. */
  attachments?: ReactNode;
  /** Extra line under the details (e.g. the rental, on the customer page). */
  meta?: ReactNode;
}) {
  const { label } = useLabels();
  const copy = useCopy();
  const situation = chargeSituation(charge);
  const badge = chargeSituationBadge(situation);
  const { amounts } = charge;
  const openPix = !amounts.isPaid ? charge.pix : null;
  const pixToCopy = openPix?.payload;

  const title =
    charge.label ?? label(LABEL_MAPS.paymentPurpose, charge.purpose);
  const pixGroup =
    pixToCopy || openPix?.encodedImage || charge.invoiceUrl ? (
      <>
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
        {openPix?.encodedImage && (
          <PixQrDialog
            pix={openPix}
            title={`${title} · ${formatCurrency(amounts.amount)}`}
          />
        )}
        {charge.invoiceUrl && (
          <ExternalLink href={charge.invoiceUrl}>
            <ExternalIcon className="size-4" aria-hidden />
            Abrir fatura
          </ExternalLink>
        )}
      </>
    ) : null;

  // One sentence instead of fragments joined by dots.
  const due = [
    `Vence ${formatCalendarDate(charge.dueDate)} por ${label(LABEL_MAPS.paymentMethod, charge.method)}`,
    charge.referenceDate &&
      `referente a ${formatCalendarDate(charge.referenceDate)}`,
    charge.channel === "manual" && "fora do Asaas",
    charge.settledByReceipt && "baixa pelos pix recebidos",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" truncate>
            {title}
          </Text>
          <Text size="xs" tone="muted">
            {due}
          </Text>
        </Box>
        <Box className="flex shrink-0 items-start gap-3">
          <Box className="space-y-1 text-right">
            <Text size="base" weight="semibold">
              {formatCurrency(amounts.amount)}
            </Text>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </Box>
          {(pixGroup || attach || actions) && (
            <OptionsMenu groups={[pixGroup, attach, actions]} />
          )}
        </Box>
      </Box>
      {meta}
      {amounts.surcharge > 0 && (
        // Paid or not: what came on top of the principal. The daily rent has
        // no fine/interest, so there the excess is an advance.
        <Text size="xs" tone="muted">
          {formatCurrency(amounts.principal)} +{" "}
          {formatCurrency(amounts.surcharge)}{" "}
          {charge.surchargeFree ? "a mais (adiantamento)" : "de multa e juros"}
        </Text>
      )}
      {amounts.isPaid && charge.paidAt && (
        <Text size="xs" tone="muted">
          Pago em {formatCalendarDate(charge.paidAt)}
        </Text>
      )}
      {amounts.discount > 0 && (
        // A rent discount covered part of it: not a shortfall.
        <Text size="xs" tone="muted">
          De {formatCurrency(amounts.principal)} ·{" "}
          {formatCurrency(amounts.discount)} de desconto
        </Text>
      )}
      {amounts.shortfall > 0 && (
        // Settled for less than due: without this the staff only sees what
        // came in, not what the customer still owes.
        <Text size="xs" weight="medium" tone="destructive">
          De {formatCurrency(amounts.principal)} · faltam{" "}
          {formatCurrency(amounts.shortfall)}
        </Text>
      )}
      {attachments}
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
