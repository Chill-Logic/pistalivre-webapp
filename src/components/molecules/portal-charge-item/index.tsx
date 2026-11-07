import { Copy, ExternalLink as ExternalIcon, QrCode } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import {
  chargeSituation,
  chargeSituationBadge,
  isPixExpired,
  pixImageSrc,
} from "@/helpers/charge";
import { useCopy } from "@/hooks/ui/useCopy";
import type { PortalCharge } from "@/types/portal";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * A charge in the renter's portal: what to pay and how (pix copy-and-paste,
 * QR on demand, or the invoice). Amount comes ready from the API.
 */
export function PortalChargeItem({ charge }: { charge: PortalCharge }) {
  const copy = useCopy();
  const [showQr, setShowQr] = useState(false);
  const situation = chargeSituation(charge);
  const badge = chargeSituationBadge(situation);
  const { amounts } = charge;
  const pix =
    charge.open && charge.pix && !isPixExpired(charge.pix.expirationDate)
      ? charge.pix
      : null;
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
      {(pix || charge.invoiceUrl) && (
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
          {charge.invoiceUrl && (
            <ExternalLink href={charge.invoiceUrl}>
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
      {charge.open && charge.pix && !pix && (
        <Text size="xs" tone="muted">
          O pix desta cobrança expirou. Pague pela fatura.
        </Text>
      )}
    </Box>
  );
}
