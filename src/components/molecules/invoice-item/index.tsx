import { ExternalLink as ExternalIcon, FileText } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { ExternalLink } from "@/components/atoms/external-link";
import { Text } from "@/components/atoms/text";
import type { PortalInvoice } from "@/types/portal";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

export function InvoiceItem({ invoice }: { invoice: PortalInvoice }) {
  const meta = [
    invoice.effectiveDate && formatCalendarDate(invoice.effectiveDate),
    invoice.rentalCode,
  ].filter(Boolean);

  return (
    <Box className="flex items-center gap-3 py-3">
      <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <Box className="min-w-0 flex-1">
        <Text weight="medium" truncate>
          {invoice.number ? `NF ${invoice.number}` : "Nota fiscal"} ·{" "}
          {formatCurrency(invoice.value)}
        </Text>
        <Text size="xs" tone="muted" truncate>
          {[...meta, invoice.serviceDescription].filter(Boolean).join(" · ")}
        </Text>
      </Box>
      {invoice.pdfUrl && (
        <ExternalLink href={invoice.pdfUrl} className="shrink-0">
          PDF
          <ExternalIcon className="size-3.5" aria-hidden />
        </ExternalLink>
      )}
    </Box>
  );
}
