import { Plus } from "lucide-react";
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
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useAddDebtPayment } from "@/hooks/api/gestao/debts/useDebtMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { DebtDetail, DebtInstallment } from "@/types/debt";
import { calendarDay, todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** Radix select reserves "": the "not an installment" entry. */
const OTHER = "__other__";

type Errors = Partial<
  Record<"amount" | "paidAt" | "surcharge" | "discount" | "barcode", string>
> & { form?: string };

/** What is still open on an installment (a suggestion; always editable). */
function openPart(installment: DebtInstallment) {
  return Math.max(
    0,
    Math.round((installment.amount - installment.paid) * 100) / 100,
  );
}

/**
 * An overdue installment was usually paid the day it was due (logging late
 * is the common case); a future one can only be paid today.
 */
function suggestedDay(installment: DebtInstallment | null, today: string) {
  if (!installment) return today;
  const due = calendarDay(installment.dueDate);
  return due < today ? due : today;
}

/**
 * Logs money the company already paid outside the system on a debt. On an
 * installment debt the default is the NEXT open installment, not the whole
 * balance (one slip there settles the debt on paper). The payment is a
 * ledger entry: it covers the oldest open installment first, and the dialog
 * says so when an earlier one is still open.
 */
export function DebtPaymentDialog({ debt }: { debt: DebtDetail }) {
  const add = useAddDebtPayment(debt.id);
  const idempotency = useIdempotencyKey();
  const openInstallments = debt.plan.filter((item) => item.status !== "PAID");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(OTHER);
  const [amount, setAmount] = useState<number | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [surcharge, setSurcharge] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const pick = (value: string) => {
    setSelected(value);
    const installment =
      openInstallments.find((i) => String(i.number) === value) ?? null;
    setAmount(installment ? openPart(installment) : debt.balance.outstanding);
    setPaidAt(suggestedDay(installment, todayInBrasilia()));
    setErrors({});
  };

  const onOpenChange = (next: boolean) => {
    if (add.isPending) return;
    setOpen(next);
    if (!next) return;
    pick(openInstallments[0] ? String(openInstallments[0].number) : OTHER);
    setSurcharge(null);
    setDiscount(null);
    setBarcode("");
    setNotes("");
    setReceipts([]);
  };

  const earlierOpen = openInstallments.findIndex(
    (i) => String(i.number) === selected,
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor pago";
    if (!paidAt) next.paidAt = "Informe a data do pagamento";
    else if (paidAt > todayInBrasilia())
      next.paidAt = "A data não pode ser no futuro";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    add.mutate(
      {
        key: idempotency.key,
        receipts,
        input: {
          amount,
          paidAt,
          ...(surcharge ? { surcharge } : {}),
          ...(discount ? { discount } : {}),
          ...(barcode.trim() ? { barcode: barcode.replace(/\s/g, "") } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          const placed = Object.keys(fields).length > 0;
          setErrors({
            ...fields,
            form: placed ? undefined : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  const options = [
    ...openInstallments.map((item) => ({
      value: String(item.number),
      label: `Parcela ${item.number} · ${item.status === "OVERDUE" ? "venceu" : item.status === "PARTIAL" ? "parcial, vence" : "vence"} ${formatCalendarDate(item.dueDate)} · ${formatCurrency(openPart(item))}`,
    })),
    { value: OTHER, label: "Outro valor" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={debt.balance.settled}>
          <Plus />
          Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar pagamento</DialogTitle>
        <DialogDescription>
          O que a empresa já pagou por fora para {debt.lendersLabel}. Falta{" "}
          {formatCurrency(debt.balance.outstanding)}.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            {openInstallments.length > 0 && (
              <Col>
                <SelectField
                  label="O que está sendo pago"
                  value={selected}
                  options={options}
                  onChange={pick}
                  disabled={add.isPending}
                />
              </Col>
            )}
            {earlierOpen > 0 && (
              <Col>
                <Alert variant="warning">
                  {earlierOpen === 1
                    ? "Há 1 parcela anterior em aberto."
                    : `Há ${earlierOpen} parcelas anteriores em aberto.`}{" "}
                  O pagamento cobre sempre da mais antiga para a frente.
                </Alert>
              </Col>
            )}
            <Col md={6}>
              <MoneyField
                label="Valor pago"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  setErrors({});
                }}
                error={errors.amount}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Data do pagamento"
                value={paidAt}
                onChange={(value) => {
                  setPaidAt(value);
                  setErrors({});
                }}
                error={errors.paidAt}
              />
            </Col>
            <Col span={6}>
              <MoneyField
                label="Multa/juros pagos"
                value={surcharge}
                onChange={setSurcharge}
                error={errors.surcharge}
              />
            </Col>
            <Col span={6}>
              <MoneyField
                label="Desconto"
                value={discount}
                onChange={setDiscount}
                error={errors.discount}
              />
            </Col>
            <Col>
              <FormField
                label="Código de barras do boleto (opcional)"
                inputMode="numeric"
                value={barcode}
                onChange={(event) => {
                  setBarcode(event.target.value);
                  setErrors({});
                }}
                error={errors.barcode}
              />
            </Col>
            <Col>
              <TextareaField
                label="Observação (opcional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={add.isPending}
              />
            </Col>
            <Col>
              <FilePicker
                label="Anexar comprovante"
                files={receipts}
                onChange={setReceipts}
              />
            </Col>
          </Row>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={add.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Registrar pagamento
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
