import {
  Copy,
  ExternalLink as ExternalIcon,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Image } from "@/components/atoms/image";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { AttachmentList } from "@/components/molecules/attachment-list";
import {
  chargeSituation,
  chargeSituationBadge,
  pixImageSrc,
} from "@/helpers/charge";
import { useRegeneratePix } from "@/hooks/api/cliente/finance/useRegeneratePix";
import { useCopy } from "@/hooks/ui/useCopy";
import { usePixExpired } from "@/hooks/ui/usePixExpired";
import type { PortalCharge } from "@/types/portal";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * A charge in the renter's portal: what to pay and how (pix copy-and-paste,
 * QR on demand, or the invoice). Amount comes ready from the API — the
 * same one the staff sees, with fine and interest when overdue. A pix that
 * lapses with the screen open turns into "Regerar" (a fresh read from Asaas).
 */
export function PortalChargeItem({
  charge,
  readOnly = false,
}: {
  charge: PortalCharge;
  /**
   * Staff seeing it as the renter: no pix nor invoice (opening the invoice
   * makes Asaas tell the renter it was viewed).
   */
  readOnly?: boolean;
}) {
  const copy = useCopy();
  const regenerate = useRegeneratePix();
  const [showQr, setShowQr] = useState(false);
  const situation = chargeSituation(charge);
  const badge = chargeSituationBadge(situation);
  const { amounts } = charge;
  const pixExpired = usePixExpired(charge.pix?.expirationDate);
  const pix =
    !readOnly && charge.open && charge.pix && !pixExpired ? charge.pix : null;
  const invoiceUrl = readOnly ? null : charge.invoiceUrl;
  const details = [
    charge.methodLabel,
    charge.dueDate && `vence ${formatCalendarDate(charge.dueDate)}`,
    charge.meta,
  ].filter(Boolean);

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" className="break-words">
            {charge.title ?? "Cobrança"}
          </Text>
          <Text size="xs" tone="muted">
            {details.join(" · ")}
          </Text>
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          <Text size="base" weight="semibold" className="tabular-nums">
            {formatCurrency(amounts.amount)}
          </Text>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </Box>
      </Box>
      {amounts.surcharge > 0 && (
        // Same number as the staff sees (owner's call). An old charge made
        // in Asaas without fine/interest may cost less there, hence the note.
        <Text size="xs" tone="muted">
          {formatCurrency(amounts.principal)} +{" "}
          {formatCurrency(amounts.surcharge)} de multa e juros
          {!amounts.isPaid && " · o valor no pagamento pode ser diferente"}
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
        // Settled for less than due: without this the renter sees only what
        // was received and not what is still owed.
        <Text size="xs" weight="medium" tone="destructive">
          De {formatCurrency(amounts.principal)} · faltam{" "}
          {formatCurrency(amounts.shortfall)}
        </Text>
      )}
      {amounts.isPaid && charge.paidAt && (
        <Text size="xs" tone="muted">
          Pago em {formatCalendarDate(charge.paidAt)}
        </Text>
      )}
      {(pix || invoiceUrl) && (
        <Box className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {pix && (
            <Button
              variant="default"
              size="sm"
              onClick={() => copy(pix.payload, "Pix copiado")}
            >
              <Copy />
              Copiar pix
            </Button>
          )}
          {pix && (
            <Button
              variant="outline"
              size="sm"
              aria-expanded={showQr}
              onClick={() => setShowQr((open) => !open)}
            >
              <QrCode />
              {showQr ? "Esconder QR code" : "Ver QR code"}
            </Button>
          )}
          {invoiceUrl && (
            <ExternalLink href={invoiceUrl}>
              Abrir fatura
              <ExternalIcon className="size-3.5" aria-hidden />
            </ExternalLink>
          )}
        </Box>
      )}
      {pix && showQr && (
        <Box className="flex justify-center pt-2">
          <Image
            src={pixImageSrc(pix.encodedImage)}
            alt="QR code do pix desta cobrança"
            className="size-48 rounded-md border bg-white p-2"
          />
        </Box>
      )}
      {!readOnly && charge.open && charge.pix && !pix && (
        <Box className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
          <Text size="xs" tone="muted">
            O pix desta cobrança expirou.
            {invoiceUrl && " Gere outro ou pague pela fatura."}
          </Text>
          <Button
            variant="outline"
            size="sm"
            disabled={regenerate.isPending}
            onClick={() => regenerate.mutate()}
          >
            {regenerate.isPending ? <Spinner /> : <RefreshCw />}
            Regerar
          </Button>
        </Box>
      )}
      <AttachmentList files={charge.attachments} />
    </Box>
  );
}
