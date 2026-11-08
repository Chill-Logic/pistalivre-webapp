import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { CustomerDebtDialog } from "@/components/organisms/customer-debt-dialog";
import { CustomerDebtPaymentDialog } from "@/components/organisms/customer-debt-payment-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { LABEL_MAPS } from "@/constants/label-maps";
import { moneyErrorMessage } from "@/helpers/money-errors";
import {
  useCustomerDebts,
  useDeleteCustomerDebt,
  useDeleteCustomerDebtPayment,
} from "@/hooks/api/gestao/customer-debts/useCustomerDebts";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CustomerDebt } from "@/types/customer-debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * What the customer owes the company outside charges. The debts form a
 * queue: the oldest open one is paid down first by the rent's debt share.
 * Loads on its own (a failure here does not take the record down).
 */
export function CustomerDebtsCard({ customerId }: { customerId: string }) {
  const debts = useCustomerDebts(customerId);
  const view = debts.data;

  return (
    <CollapsibleCard
      title="Débitos do cliente"
      count={view?.items.filter((debt) => debt.balance > 0).length}
      storageKey="customer-debts"
      contentClassName="space-y-3"
      actions={<CustomerDebtDialog customerId={customerId} />}
    >
      {debts.isPending && (
        <SkeletonRegion label="Carregando débitos…">
          <CustomerDebtsSkeletonRows />
        </SkeletonRegion>
      )}
      {debts.isError && (
        <QueryError error={debts.error} onRetry={() => debts.refetch()} />
      )}
      {view && view.items.length === 0 && (
        <Text tone="muted">Nenhum débito.</Text>
      )}
      {view && view.items.length > 0 && (
        <>
          <Text tone="muted">
            Saldo devedor {formatCurrency(view.totalBalance)}
            {view.weeklyShare > 0 &&
              ` · abatendo ${formatCurrency(view.weeklyShare)} por semana pela diária`}
          </Text>
          <List className="divide-y">
            {view.items.map((debt) => (
              <CustomerDebtRow
                key={debt.id}
                customerId={customerId}
                debt={debt}
              />
            ))}
          </List>
        </>
      )}
    </CollapsibleCard>
  );
}

function CustomerDebtRow({
  customerId,
  debt,
}: {
  customerId: string;
  debt: CustomerDebt;
}) {
  const { label } = useLabels();
  const remove = useDeleteCustomerDebt(customerId);
  const removePayment = useDeleteCustomerDebtPayment(customerId);
  const [confirming, setConfirming] = useState(false);
  const origin = label(LABEL_MAPS.customerDebtOrigin, debt.origin);

  return (
    <ListItem className="space-y-2 py-3">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" className="break-words">
            {origin}
            {debt.description && ` · ${debt.description}`}
          </Text>
          <Text size="xs" tone="muted">
            {formatCurrency(debt.amount)} em{" "}
            {formatCalendarDate(debt.incurredAt)} · pago{" "}
            {formatCurrency(debt.paidFromRent + debt.paidDirect)} (diária{" "}
            {formatCurrency(debt.paidFromRent)}
            {debt.paidDirect > 0 &&
              ` · à vista ${formatCurrency(debt.paidDirect)}`}
            ) · abate desde {formatCalendarDate(debt.startsAt)}
          </Text>
          {debt.notes && (
            <Text size="xs" tone="muted" className="break-words">
              {debt.notes}
            </Text>
          )}
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          {debt.balance > 0 ? (
            <Text weight="semibold" className="tabular-nums">
              {formatCurrency(debt.balance)}
            </Text>
          ) : (
            <Badge variant="success">Quitado</Badge>
          )}
        </Box>
      </Box>

      {debt.payments.length > 0 && (
        <List className="space-y-1">
          {debt.payments.map((payment) => (
            <ListItem
              key={payment.id}
              className="flex items-center justify-between gap-2"
            >
              <Text size="xs" tone="muted">
                À vista em {formatCalendarDate(payment.paidAt)} ·{" "}
                {formatCurrency(payment.amount)}
                {payment.notes && ` · ${payment.notes}`}
              </Text>
              <ConfirmDialog
                destructive
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label={`Excluir pagamento de ${formatCalendarDate(payment.paidAt)}`}
                  >
                    <Trash2 />
                  </Button>
                }
                title="Excluir pagamento?"
                description={`O pagamento de ${formatCurrency(payment.amount)} sai do débito e o saldo volta a subir.`}
                confirmLabel="Excluir pagamento"
                isPending={removePayment.isPending}
                onConfirm={() =>
                  removePayment.mutate(payment.id, {
                    onError: (error) => toast.error(moneyErrorMessage(error)),
                  })
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box className="flex flex-wrap gap-1">
        {debt.balance > 0 && (
          <CustomerDebtPaymentDialog customerId={customerId} debt={debt} />
        )}
        <CustomerDebtDialog customerId={customerId} debt={debt} />
        <ConfirmDialog
          destructive
          open={confirming}
          onOpenChange={setConfirming}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Excluir débito ${origin}`}
            >
              <Trash2 />
            </Button>
          }
          title="Excluir débito?"
          description="O débito some, com os anexos e os pagamentos à vista. A parte da diária deixa de abatê-lo."
          confirmLabel="Excluir débito"
          isPending={remove.isPending}
          onConfirm={() =>
            remove.mutate(debt.id, {
              onSuccess: () => setConfirming(false),
              onError: (error) => toast.error(moneyErrorMessage(error)),
            })
          }
        />
      </Box>
    </ListItem>
  );
}

function CustomerDebtsSkeletonRows() {
  return (
    <Box className="space-y-3">
      <Skeleton shape="text" className="w-56 text-sm" />
      {[0, 1].map((index) => (
        <Box key={index} className="space-y-2 py-2">
          <Skeleton shape="text" className="w-48 text-sm" />
          <Skeleton shape="text" className="w-72 text-xs" />
        </Box>
      ))}
    </Box>
  );
}

export function CustomerDebtsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-40 text-base" />
      </CardHeader>
      <CardContent>
        <CustomerDebtsSkeletonRows />
      </CardContent>
    </Card>
  );
}
