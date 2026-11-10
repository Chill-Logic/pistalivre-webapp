import { Plus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
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
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useDebt } from "@/hooks/api/gestao/debts/useDebt";
import { useAddDebtPayment } from "@/hooks/api/gestao/debts/useDebtMutations";
import { useDebtPaymentPreview } from "@/hooks/api/gestao/debts/useDebtPreviews";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { DebtDetail, DebtInstallment } from "@/types/debt";
import { canonicalBarcode, readBoletoCode } from "@/utils/boleto";
import { calendarDay, todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** Radix select reserves "": the "not an installment" entry. */
const OTHER = "__other__";

type Errors = Partial<
  Record<"amount" | "paidAt" | "surcharge" | "discount" | "barcode", string>
> & { form?: string };

type AddPayment = ReturnType<typeof useAddDebtPayment>;

/**
 * An overdue installment was usually paid the day it was due (logging late
 * is the common case); a future one can only be paid today.
 */
function suggestedDay(installment: DebtInstallment | null, today: string) {
  if (!installment) return today;
  const due = calendarDay(installment.dueDate);
  return due < today ? due : today;
}

type DebtPaymentDialogProps = {
  debt: DebtDetail;
  /** Number of the installment to start on ("Pagar" on its row). */
  installment?: number;
  /** Replaces the "Registrar pagamento" button. */
  trigger?: ReactNode;
};

/**
 * Logs money the company already paid outside the system on a debt. On an
 * installment debt the default is the NEXT open installment, not the whole
 * balance (one slip there settles the debt on paper). The payment is a
 * ledger entry: it covers the oldest open installment first, and the dialog
 * says so when an earlier one is still open.
 */
export function DebtPaymentDialog({
  debt,
  installment,
  trigger,
}: DebtPaymentDialogProps) {
  const add = useAddDebtPayment(debt.id);
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!add.isPending) setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" disabled={debt.balance.settled}>
            <Plus />
            Registrar pagamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {open && (
          <DebtPaymentForm
            debt={debt}
            add={add}
            installment={installment}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * The same dialog from a row of the debt list, which has no plan nor
 * payments: the debt's detail is fetched when it opens.
 */
export function DebtListPaymentDialog({
  debtId,
  trigger,
  installment,
}: {
  debtId: string;
  trigger: ReactNode;
  /** Installment to start on (a row of the month's bills). */
  installment?: number;
}) {
  const add = useAddDebtPayment(debtId);
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!add.isPending) setOpen(next);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {open && (
          <DebtPaymentLoader
            debtId={debtId}
            add={add}
            installment={installment}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DebtPaymentLoader({
  debtId,
  add,
  installment,
  onDone,
}: {
  debtId: string;
  add: AddPayment;
  installment?: number;
  onDone: () => void;
}) {
  const debt = useDebt(debtId);
  if (debt.data) {
    return (
      <DebtPaymentForm
        debt={debt.data}
        add={add}
        installment={installment}
        onDone={onDone}
      />
    );
  }
  return (
    <>
      <DialogTitle>Registrar pagamento</DialogTitle>
      <DialogDescription>
        {debt.isError ? toApiError(debt.error).message : "Carregando a dívida…"}
      </DialogDescription>
      {debt.isPending && (
        <Box className="space-y-4" aria-busy>
          <Skeleton className="h-11 md:h-9" />
          <Skeleton className="h-11 md:h-9" />
          <Skeleton className="h-11 md:h-9" />
        </Box>
      )}
    </>
  );
}

function DebtPaymentForm({
  debt,
  add,
  installment,
  onDone,
}: {
  debt: DebtDetail;
  add: AddPayment;
  installment?: number;
  onDone: () => void;
}) {
  const idempotency = useIdempotencyKey();
  const openInstallments = debt.plan.filter((item) => item.status !== "PAID");
  const initial =
    openInstallments.find((item) => item.number === installment) ??
    openInstallments[0] ??
    null;
  const [selected, setSelected] = useState(
    initial ? String(initial.number) : OTHER,
  );
  const [amount, setAmount] = useState<number | null>(
    initial ? initial.due : debt.balance.outstanding,
  );
  const [paidAt, setPaidAt] = useState(() =>
    suggestedDay(initial, todayInBrasilia()),
  );
  // Typed by hand; until then the surcharge follows the amount (below).
  const [typedSurcharge, setTypedSurcharge] = useState<number | null>(null);
  const [surchargeTyped, setSurchargeTyped] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const current =
    openInstallments.find((item) => String(item.number) === selected) ?? null;

  // Paying an installment with more than it asks for is the late fee: the
  // excess fills "Multa/juros pagos" (it does not amortize). Splitting the
  // typed amount, in cents; the balance itself is still the server's.
  const excess =
    current && amount
      ? Math.max(0, Math.round(amount * 100) - Math.round(current.due * 100)) /
        100
      : 0;
  const surcharge = surchargeTyped
    ? typedSurcharge
    : excess > 0
      ? excess
      : null;

  // "Fica faltando X": the balance after this payment, by the server.
  const preview = useDebtPaymentPreview(
    debt.id,
    amount && amount > 0
      ? {
          amount,
          ...(surcharge ? { surcharge } : {}),
          ...(discount ? { discount } : {}),
        }
      : null,
  );
  const after = amount && amount > 0 ? preview.data : undefined;

  const pick = (value: string) => {
    setSelected(value);
    const next =
      openInstallments.find((item) => String(item.number) === value) ?? null;
    setAmount(next ? next.due : debt.balance.outstanding);
    setPaidAt(suggestedDay(next, todayInBrasilia()));
    setSurchargeTyped(false);
    setTypedSurcharge(null);
    setErrors({});
  };

  const earlierOpen = openInstallments.findIndex(
    (item) => String(item.number) === selected,
  );

  // The pasted code is read right here: amount and due date come INSIDE it,
  // which lets the slip be checked before paying instead of after.
  const reading = barcode.trim() ? readBoletoCode(barcode) : null;
  const boleto = reading?.ok ? reading.code : null;
  const alreadyPaid =
    boleto != null &&
    debt.payments.some(
      (payment) =>
        payment.barcode && canonicalBarcode(payment.barcode) === boleto.barcode,
    );
  // Only compared (in cents), never subtracted: the balance is the server's.
  const amountMismatch =
    boleto?.amount != null &&
    current != null &&
    Math.round(boleto.amount * 100) !== Math.round(current.due * 100);

  const onBarcodeChange = (value: string) => {
    setBarcode(value);
    setErrors({});
    // The slip's amount is what will be paid; until it reads, keep the typed one.
    const read = readBoletoCode(value);
    if (read.ok && read.code.amount != null) setAmount(read.code.amount);
  };

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
          onDone();
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
      label: `Parcela ${item.number} · ${item.status === "OVERDUE" ? "venceu" : item.status === "PARTIAL" ? "parcial, vence" : "vence"} ${formatCalendarDate(item.dueDate)} · ${formatCurrency(item.due)}`,
    })),
    { value: OTHER, label: "Outro valor" },
  ];

  return (
    <>
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
          <Col>
            <FormField
              label="Código do boleto (opcional)"
              placeholder="Cole a linha digitável ou o código de barras"
              inputMode="numeric"
              value={barcode}
              onChange={(event) => onBarcodeChange(event.target.value)}
              error={
                errors.barcode ??
                (reading && !reading.ok ? reading.message : undefined)
              }
            />
          </Col>
          {boleto && (
            <Col className="space-y-2">
              <Text size="xs" tone="muted">
                {boleto.kind === "BANK"
                  ? `Boleto do banco ${boleto.bankCode}`
                  : "Convênio/tributo"}
                {boleto.amount != null
                  ? ` · ${formatCurrency(boleto.amount)}`
                  : " · sem valor no código"}
                {boleto.dueDate &&
                  ` · vence ${formatCalendarDate(boleto.dueDate)}`}
                {boleto.warning && ` · ${boleto.warning}`}
              </Text>
              {alreadyPaid && (
                <Alert>
                  Este boleto já foi pago: há um pagamento com o mesmo código
                  nesta dívida.
                </Alert>
              )}
              {amountMismatch && boleto.amount != null && current && (
                <Alert variant="warning">
                  O boleto é de {formatCurrency(boleto.amount)} e a parcela é de{" "}
                  {formatCurrency(current.due)}
                  {boleto.amount > current.due
                    ? ". A diferença entrou em “Multa/juros pagos”: confira."
                    : ". Confira se é o boleto certo."}
                </Alert>
              )}
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
              onChange={(value) => {
                setTypedSurcharge(value);
                setSurchargeTyped(true);
                setErrors({});
              }}
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
          {!surchargeTyped && excess > 0 && current && (
            <Col>
              <Text size="xs" tone="muted">
                {formatCurrency(excess)} acima da parcela (
                {formatCurrency(current.due)}) entraram como multa/juros.
              </Text>
            </Col>
          )}
          {after && (
            <Col aria-live="polite">
              {after.exceeds ? (
                <Alert variant="warning">
                  Passa do que falta ({formatCurrency(after.outstanding)}): o
                  pagamento seria recusado. Confira o valor, a multa e o
                  desconto.
                </Alert>
              ) : after.settles ? (
                <Text weight="medium" tone="success">
                  Este pagamento quita a dívida.
                </Text>
              ) : (
                <Text tone="muted">
                  Depois deste pagamento fica faltando{" "}
                  {formatCurrency(after.remaining)}.
                </Text>
              )}
            </Col>
          )}
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
    </>
  );
}
