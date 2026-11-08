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
import { InvoiceLinkSelect } from "@/components/organisms/invoice-link-select";
import { QueryError } from "@/components/organisms/query-error";
import { StandaloneInvoiceDialog } from "@/components/organisms/standalone-invoice-dialog";
import { canCancelInvoice } from "@/helpers/invoice";
import { useCustomerInvoices } from "@/hooks/api/gestao/invoices/useInvoices";
import type { RentalListItem } from "@/types/rental";

const SKELETON_ROWS = 2;

type CustomerInvoicesCardProps = {
  customer: { id: string; name: string; asaasCustomerId: string | null };
  rentals: Pick<RentalListItem, "id" | "code" | "status">[];
};

/**
 * Every NF of the customer. A loose one (no rental) can be linked to one of
 * the customer's rentals; a cancellable one can be canceled.
 */
export function CustomerInvoicesCard({
  customer,
  rentals,
}: CustomerInvoicesCardProps) {
  const linked = Boolean(customer.asaasCustomerId);
  const invoices = useCustomerInvoices(customer.id);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Notas fiscais</CardTitle>
        {linked && (
          <StandaloneInvoiceDialog
            customer={{ id: customer.id, name: customer.name }}
          />
        )}
      </CardHeader>
      <CardContent>
        {!linked ? (
          <Text tone="muted">Cliente ainda não vinculado ao Asaas.</Text>
        ) : (
          <>
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
                <Text tone="muted">Nenhuma nota fiscal.</Text>
              )}
            {invoices.data && invoices.data.items.length > 0 && (
              <Box className="divide-y">
                {invoices.data.items.map((invoice) => (
                  <StaffInvoiceItem
                    key={invoice.id}
                    invoice={invoice}
                    actions={
                      <>
                        {!invoice.rentalId && (
                          <InvoiceLinkSelect
                            invoice={invoice}
                            rentals={rentals}
                          />
                        )}
                        {canCancelInvoice(invoice.status) && (
                          <InvoiceCancelButton invoice={invoice} />
                        )}
                      </>
                    }
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerInvoicesCardSkeleton() {
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
