import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RentReceiptDialog } from "@/components/organisms/rent-receipt-dialog";
import { useRemoveRentReceipt } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useRentalBilling } from "@/hooks/api/gestao/rentals/useRentalBilling";
import type { RentReceipt } from "@/types/billing";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * Pix that landed in our account for this rental (outside Asaas). The
 * settlement of the charges is derived from them; deleting one undoes what
 * it paid.
 */
export function RentReceiptsCard({ rentalId }: { rentalId: string }) {
  const billing = useRentalBilling(rentalId);

  if (billing.isPending) return <RentReceiptsCardSkeleton />;
  if (billing.isError) {
    return (
      <QueryError error={billing.error} onRetry={() => billing.refetch()} />
    );
  }

  const { items, credit } = billing.data.receipts;
  const rows = [...items].reverse();

  return (
    <CollapsibleCard
      title="Pix recebidos"
      count={items.length}
      storageKey="rental-rent-receipts"
      contentClassName="space-y-3"
      actions={<RentReceiptDialog rentalId={rentalId} />}
    >
      <Text size="xs" tone="muted">
        Fora do Asaas. Cada pix paga o aluguel em aberto, do mais antigo para a
        frente.
      </Text>
      {rows.length === 0 ? (
        <Text tone="muted">Nenhum pix registrado nesta locação.</Text>
      ) : (
        <Box className="divide-y rounded-md border">
          {rows.map((receipt) => (
            <RentReceiptRow
              key={receipt.id}
              rentalId={rentalId}
              receipt={receipt}
            />
          ))}
        </Box>
      )}
      {credit > 0 && (
        <Text size="xs" tone="muted">
          {formatCurrency(credit)} de crédito (paga a próxima cobrança).
        </Text>
      )}
    </CollapsibleCard>
  );
}

function RentReceiptRow({
  rentalId,
  receipt,
}: {
  rentalId: string;
  receipt: RentReceipt;
}) {
  const remove = useRemoveRentReceipt(rentalId);
  const [open, setOpen] = useState(false);
  return (
    <Box className="flex items-center gap-3 p-3">
      <Box className="min-w-0 flex-1">
        <Text weight="medium">{formatCurrency(receipt.amount)}</Text>
        <Text size="xs" tone="muted" truncate>
          {formatCalendarDate(receipt.receivedAt)}
          {receipt.notes ? ` · ${receipt.notes}` : ""}
        </Text>
      </Box>
      <ConfirmDialog
        destructive
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Excluir pix de ${formatCalendarDate(receipt.receivedAt)}`}
          >
            <Trash2 />
          </Button>
        }
        title="Excluir pix?"
        description="O aluguel que ele pagava volta a ficar em aberto. Use quando o pix foi lançado por engano."
        confirmLabel="Excluir pix"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(receipt.id, {
            onSuccess: () => setOpen(false),
            onError: (error) => toast.error(error.message),
          })
        }
      />
    </Box>
  );
}

export function RentReceiptsCardSkeleton() {
  return (
    <Box className="space-y-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <Box className="flex items-center justify-between">
        <Skeleton shape="text" className="w-32 text-base" />
        <Skeleton className="h-9 w-32" />
      </Box>
      <Skeleton shape="text" className="w-2/3 text-xs" />
    </Box>
  );
}
