import { Box } from "@/components/atoms/box";
import { Alert } from "@/components/atoms/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  StaffInvoiceItem,
  StaffInvoiceItemSkeleton,
} from "@/components/molecules/staff-invoice-item";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { InvoiceCancelButton } from "@/components/organisms/invoice-cancel-button";
import { QueryError } from "@/components/organisms/query-error";
import { RentalInvoiceDialog } from "@/components/organisms/rental-invoice-dialog";
import { canCancelInvoice } from "@/helpers/invoice";
import { useRentalInvoices } from "@/hooks/api/gestao/invoices/useInvoices";

const SKELETON_ROWS = 2;

/** NFs of the rental (read-through of Asaas) + "Emitir NF" and cancel. */
export function RentalInvoicesCard({ rentalId }: { rentalId: string }) {
  const invoices = useRentalInvoices(rentalId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Notas fiscais</CardTitle>
        {invoices.data && (
          <RentalInvoiceDialog
            rentalId={rentalId}
            suggestions={invoices.data.suggestions}
          />
        )}
      </CardHeader>
      <CardContent>
        {invoices.isPending && (
          <SkeletonRegion label="Carregando notas fiscais…">
            <Box className="divide-y">
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <StaffInvoiceItemSkeleton key={index} />
              ))}
            </Box>
          </SkeletonRegion>
        )}
        {invoices.isError && (
          <QueryError
            error={invoices.error}
            onRetry={() => invoices.refetch()}
          />
        )}
        {invoices.data?.error && (
          <Alert variant="warning">
            Não deu para ler as notas no Asaas agora: {invoices.data.error}
          </Alert>
        )}
        {invoices.data &&
          !invoices.data.error &&
          invoices.data.items.length === 0 && (
            <Text tone="muted">Nenhuma nota fiscal emitida.</Text>
          )}
        {invoices.data && invoices.data.items.length > 0 && (
          <Box className="divide-y">
            {invoices.data.items.map((invoice) => (
              <StaffInvoiceItem
                key={invoice.id}
                invoice={invoice}
                actions={
                  canCancelInvoice(invoice.status) && (
                    <InvoiceCancelButton invoice={invoice} />
                  )
                }
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalInvoicesCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Skeleton shape="text" className="w-32 text-base" />
        <Skeleton className="h-9 w-28" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <StaffInvoiceItemSkeleton key={index} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
