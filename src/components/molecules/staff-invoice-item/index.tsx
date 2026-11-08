import { ExternalLink as ExternalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { ExternalLink } from "@/components/atoms/external-link";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { invoiceStatusVariant } from "@/helpers/invoice";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Invoice } from "@/types/invoice";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** One NFS-e: value, number, date, status, PDF and the staff actions. */
export function StaffInvoiceItem({
  invoice,
  actions,
}: {
  invoice: Invoice;
  /** Cancel / link to a rental. */
  actions?: ReactNode;
}) {
  const { label } = useLabels();

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium">
            {invoice.number ? `NF ${invoice.number}` : "NF sem número"}
          </Text>
          <Text size="xs" tone="muted">
            {invoice.effectiveDate
              ? `Emissão ${formatCalendarDate(invoice.effectiveDate)}`
              : "Sem data de emissão"}
          </Text>
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          <Text size="base" weight="semibold" className="tabular-nums">
            {formatCurrency(invoice.value)}
          </Text>
          <Badge variant={invoiceStatusVariant(invoice.status)}>
            {label(LABEL_MAPS.invoiceStatus, invoice.status)}
          </Badge>
        </Box>
      </Box>
      <Text size="xs" tone="muted" className="whitespace-pre-line break-words">
        {invoice.serviceDescription}
      </Text>
      {(invoice.pdfUrl || actions) && (
        <Box className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {invoice.pdfUrl && (
            <ExternalLink href={invoice.pdfUrl}>
              Abrir PDF
              <ExternalIcon className="size-3.5" aria-hidden />
            </ExternalLink>
          )}
          {actions}
        </Box>
      )}
    </Box>
  );
}

export function StaffInvoiceItemSkeleton() {
  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0 flex-1 space-y-2">
          <Skeleton shape="text" className="w-24 text-sm" />
          <Skeleton shape="text" className="w-36 text-xs" />
        </Box>
        <Box className="flex shrink-0 flex-col items-end space-y-2">
          <Skeleton shape="text" className="w-20 text-base" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
      </Box>
      <Skeleton shape="text" className="w-3/4 text-xs" />
    </Box>
  );
}
