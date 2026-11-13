import { useQueryClient } from "@tanstack/react-query";
import { HandCoins } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Spinner } from "@/components/atoms/spinner";
import { queryKeys } from "@/constants/query-keys";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useAddRentReceipt } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { BankCredit } from "@/types/reconciliation";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type ReconciliationReceiptDialogProps = {
  credit: BankCredit;
  rentalId: string;
  rentalCode: string;
};

/**
 * Accepting a suggestion of a daily rental: the pix of the statement becomes
 * a "pix recebido" of the rental (value + day, as on the bank), which pays the
 * oldest open days first. One confirmation, nothing to type.
 */
export function ReconciliationReceiptDialog({ credit, rentalId, rentalCode }: ReconciliationReceiptDialogProps) {
  const queryClient = useQueryClient();
  const add = useAddRentReceipt(rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = () => {
    setError(null);
    add.mutate(
      {
        key: idempotency.key,
        input: {
          amount: credit.amount,
          receivedAt: credit.date,
          notes: `Conciliado do extrato do Inter — ${credit.payerName}`,
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
        },
        onError: (e) => setError(moneyErrorMessage(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !add.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="sm">
          <HandCoins />
          Registrar pix
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar pix recebido</DialogTitle>
        <DialogDescription>
          {formatCurrency(credit.amount)} de {credit.payerName} em {formatCalendarDate(credit.date)} na {rentalCode}.
          O valor abate as diárias mais antigas em aberto; o que sobrar fica de crédito.
        </DialogDescription>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={add.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={confirm} disabled={add.isPending}>
            {add.isPending && <Spinner className="text-primary-foreground" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
