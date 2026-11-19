import { ArrowRightLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useTransferRentBalance } from "@/hooks/api/gestao/customer-debts/useCustomerDebts";
import type { RentBalance } from "@/types/customer-debt";
import { todayInBrasilia } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

/**
 * Moves an ended rental's open rent into a customer debt ("Acerto de
 * contas"). The server computes the amount from the ledger and puts a credit
 * of the same value on the rental, so the value lives in one place only.
 */
export function TransferRentBalanceDialog({
  customerId,
  balance,
}: {
  customerId: string;
  balance: RentBalance;
}) {
  const transfer = useTransferRentBalance(customerId);
  const [open, setOpen] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (transfer.isPending) return;
    setOpen(next);
    if (!next) return;
    setStartsAt(todayInBrasilia());
    setNotes("");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!startsAt) {
      setError("Informe a partir de quando abate");
      return;
    }
    transfer.mutate(
      {
        rentalId: balance.rentalId,
        input: { startsAt, notes: notes.trim() || null },
      },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => setError(toApiError(err).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowRightLeft />
          Transferir para débito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Transferir saldo da {balance.code}</DialogTitle>
        <DialogDescription>
          O saldo de {formatCurrency(balance.balance)} sai da locação e vira um
          débito "Acerto de contas", pago à vista ou pela parte da diária de
          outra locação. Na locação entra um desconto do mesmo valor. Para
          desfazer, exclua o débito: o saldo volta para a locação.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6}>
              <DateField
                label="Abate a partir de"
                value={startsAt}
                onChange={setStartsAt}
              />
            </Col>
            <Col md={6}>
              <Text size="sm" tone="muted">
                O valor é o do extrato da locação na hora de transferir.
              </Text>
            </Col>
            <Col>
              <TextareaField
                label="Observação interna (opcional)"
                rows={2}
                className="min-h-16"
                placeholder="Ex.: acordo de pagar em 4 semanas"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={transfer.isPending}
              />
            </Col>
          </Row>
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={transfer.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={transfer.isPending}>
              {transfer.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Transferir {formatCurrency(balance.balance)}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
