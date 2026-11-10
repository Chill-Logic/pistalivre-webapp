import { Trash2 } from "lucide-react";
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
import { Spinner } from "@/components/atoms/spinner";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { DocumentsCard } from "@/components/organisms/documents-card";
import { PaymentMethodFields } from "@/components/organisms/payment-method-fields";
import { LABEL_MAPS } from "@/constants/label-maps";
import { queryKeys } from "@/constants/query-keys";
import { toApiError } from "@/helpers/api-error";
import { conversionNote, moneyWithEstimate } from "@/helpers/currency";
import { useExchangeQuote } from "@/hooks/api/gestao/exchange-rates/useExchangeQuote";
import { useExpense } from "@/hooks/api/gestao/expenses/useExpense";
import {
  useDeleteExpense,
  useSaveExpense,
} from "@/hooks/api/gestao/expenses/useExpenseMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type { Currency, ExpensePaymentMethod } from "@/types/currency";
import type { ExpenseInput, ExpenseStatus, MonthItem } from "@/types/expense";
import type { SupplierDetail } from "@/types/supplier";
import { calendarDay, todayInBrasilia } from "@/utils/date";
import { currencySymbol, formatCurrency } from "@/utils/format";
import {
  addMonths,
  currentMonth,
  formatMonth,
  monthsBetween,
} from "@/utils/month";

/**
 * What the dialog records:
 * - `item`: a row of the month (fixed cost or one-off) — records it, or edits
 *   what was recorded;
 * - `oneOff`: a new one-off expense, starting on `month`;
 * - `supplierMonth`: any month of a fixed cost, past ones included (the
 *   "Registrar mês" of the cost's page), picking the vehicle when billed per
 *   vehicle.
 */
export type ExpenseDialogTarget =
  | { kind: "item"; item: MonthItem }
  | { kind: "oneOff"; month: string }
  | { kind: "supplierMonth"; supplier: SupplierDetail; months: string[] };

const STATUSES: ExpenseStatus[] = ["PAID", "OPEN", "WAIVED"];

type Field =
  | "month"
  | "vehicleId"
  | "description"
  | "amount"
  | "status"
  | "paidAt"
  | "notes"
  | "currency"
  | "foreignAmount"
  | "paymentMethod"
  | "paymentCardId";
type Errors = Partial<Record<Field, string>> & { form?: string };

type ExpenseDialogProps = {
  target: ExpenseDialogTarget;
  trigger: ReactNode;
};

/** Records what happened to a bill: paid (when), still open, or no bill. */
export function ExpenseDialog({ target, trigger }: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) setOpen(next);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {open && (
          <ExpenseForm
            target={target}
            onBusyChange={setBusy}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type FormState = {
  month: string;
  vehicleId: string;
  description: string;
  status: ExpenseStatus;
  /** In reais (what left the cash). */
  amount: number | null;
  paidAt: string;
  notes: string;
  currency: Currency;
  /** In `currency` (only when it isn't BRL). */
  foreignAmount: number | null;
  paymentMethod: ExpensePaymentMethod | null;
  paymentCardId: string | null;
  /**
   * The reais were typed (or recorded): today's quote no longer fills them.
   * A new foreign bill starts false, so the server's estimate shows up.
   */
  amountTouched: boolean;
};

function initialState(target: ExpenseDialogTarget): FormState {
  const today = todayInBrasilia();
  if (target.kind === "item") {
    const { item } = target;
    return {
      month: item.month,
      vehicleId: item.vehicle?.id ?? "",
      description: item.kind === "ONE_OFF" ? item.description : "",
      status: (item.expense ? item.status : "PAID") as ExpenseStatus,
      amount: item.amount ?? item.expected,
      paidAt: item.paidAt ? calendarDay(item.paidAt) : today,
      notes: item.expense?.notes ?? "",
      currency: item.currency,
      foreignAmount: item.expense?.foreignAmount ?? item.expectedForeign,
      paymentMethod: item.paymentMethod,
      paymentCardId: item.paymentCard?.id ?? null,
      amountTouched: Boolean(item.expense),
    };
  }
  const month =
    target.kind === "oneOff" ? target.month : (target.months[0] ?? currentMonth());
  const supplier = target.kind === "supplierMonth" ? target.supplier : null;
  const perVehicle = supplier?.billing === "PER_VEHICLE";
  const firstVehicle = perVehicle ? supplier?.vehicles[0] : undefined;
  // The cost's amount is in its currency; the reais come from the quote.
  const costAmount = supplier
    ? perVehicle
      ? (firstVehicle?.monthlyAmount ?? null)
      : supplier.scope === "COMPANY"
        ? supplier.monthlyAmount
        : supplier.vehiclesMonthlyTotal
    : null;
  const foreign = supplier ? supplier.currency !== "BRL" : false;
  return {
    month,
    vehicleId: firstVehicle?.vehicle.id ?? "",
    description: "",
    status: "PAID",
    amount: foreign ? null : costAmount,
    paidAt: today,
    notes: "",
    currency: supplier?.currency ?? "BRL",
    foreignAmount: foreign ? costAmount : null,
    paymentMethod: supplier?.paymentMethod ?? null,
    paymentCardId: supplier?.paymentCard?.id ?? null,
    amountTouched: false,
  };
}

function ExpenseForm({
  target,
  onBusyChange,
  onDone,
}: {
  target: ExpenseDialogTarget;
  onBusyChange: (busy: boolean) => void;
  onDone: () => void;
}) {
  const { options } = useLabels();
  const idempotency = useIdempotencyKey();
  const item = target.kind === "item" ? target.item : null;
  const expenseId = item?.expense?.id;
  const save = useSaveExpense(expenseId);
  const remove = useDeleteExpense();
  const recorded = useExpense(expenseId ?? null);
  const picker = useVehicleOptions({
    include: item?.vehicle
      ? { value: item.vehicle.id, label: `${item.vehicle.plate} · ${item.vehicle.label}` }
      : undefined,
  });

  const supplier =
    target.kind === "supplierMonth"
      ? target.supplier
      : null;
  const supplierId = item?.supplier?.id ?? supplier?.id ?? null;
  const isOneOff = !supplierId;
  const perVehicle = supplier?.billing === "PER_VEHICLE";

  const [state, setState] = useState(() => initialState(target));
  const isForeign = state.currency !== "BRL";
  const quote = useExchangeQuote({
    currency: state.currency,
    amount: state.foreignAmount,
    paymentMethod: state.paymentMethod,
    paymentCardId: state.paymentCardId,
  });
  // Until the reais are typed, they follow today's quote (server math).
  const amount =
    isForeign && !state.amountTouched && quote.data?.brl != null
      ? quote.data.brl
      : state.amount;
  const [picked, setPicked] = useState<RemoteOption | null>(null);
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const pending = save.isPending || remove.isPending;

  const set = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors({});
  };

  const monthOptions = (
    target.kind === "supplierMonth"
      ? target.months
      : monthsBetween(addMonths(currentMonth(), -24), addMonths(currentMonth(), 1))
  ).map((month) => ({ value: month, label: formatMonth(month) }));

  const statusOptions = options(LABEL_MAPS.expenseStatus).filter((option) =>
    STATUSES.includes(option.value as ExpenseStatus),
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (isOneOff && !state.description.trim()) {
      next.description = "Diga o que foi a despesa";
    }
    if (state.status !== "WAIVED" && (amount === null || amount < 0)) {
      next.amount = "Informe o valor";
    }
    if (isForeign && state.status !== "WAIVED" && state.foreignAmount === null) {
      next.foreignAmount = "Informe o valor";
    }
    if (state.status === "PAID") {
      if (!state.paidAt) next.paidAt = "Informe o dia do pagamento";
      else if (state.paidAt > todayInBrasilia())
        next.paidAt = "O pagamento não pode ser no futuro";
    }
    if (perVehicle && !state.vehicleId) next.vehicleId = "Escolha o veículo";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input: ExpenseInput = {
      supplierId,
      vehicleId: (isOneOff ? (picked?.value ?? state.vehicleId) : state.vehicleId) || null,
      month: state.month,
      description: isOneOff ? state.description.trim() : null,
      amount: amount ?? 0,
      status: state.status,
      paidAt: state.status === "PAID" ? state.paidAt : null,
      notes: state.notes.trim() || null,
      currency: state.currency,
      foreignAmount: isForeign ? state.foreignAmount : null,
      paymentMethod: state.paymentMethod,
      paymentCardId: state.paymentCardId,
    };
    onBusyChange(true);
    save.mutate(
      { input, key: idempotency.key, receipts },
      {
        onSuccess: () => {
          idempotency.renew();
          onDone();
        },
        onError: (error) => {
          const api = toApiError(error);
          const fields = api.fields ?? {};
          const placed = Object.keys(fields).some((key) => key !== "supplierId");
          setErrors({ ...fields, form: placed ? undefined : api.message });
        },
        onSettled: () => onBusyChange(false),
      },
    );
  };

  const onDelete = () => {
    if (!expenseId) return;
    onBusyChange(true);
    remove.mutate(expenseId, {
      onSuccess: onDone,
      onError: (error) => setErrors({ form: toApiError(error).message }),
      onSettled: () => onBusyChange(false),
    });
  };

  const name = item?.description ?? supplier?.name ?? "Despesa avulsa";
  const context = [
    item && formatMonth(item.month),
    item?.vehicle?.plate,
    item?.expected != null &&
      `previsto ${
        item.expectedForeign != null
          ? moneyWithEstimate(item.expectedForeign, item.currency, item.expected)
          : formatCurrency(item.expected)
      }`,
  ].filter(Boolean);

  return (
    <>
      <DialogTitle>
        {expenseId
          ? "Editar lançamento"
          : target.kind === "oneOff"
            ? "Nova despesa avulsa"
            : "Registrar mês"}
      </DialogTitle>
      <DialogDescription>
        {isOneOff && !item
          ? "Um gasto pontual da operação (IPVA, licenciamento, uma taxa). O pagamento é feito por fora."
          : `${name}${context.length ? ` · ${context.join(" · ")}` : ""}`}
      </DialogDescription>
      <Form onSubmit={onSubmit} noValidate className="space-y-4">
        <Row className="gap-y-4">
          {isOneOff && (
            <Col>
              <FormField
                label="O que foi"
                placeholder="Ex.: IPVA da moto"
                value={state.description}
                onChange={(event) => set("description", event.target.value)}
                error={errors.description}
                maxLength={200}
              />
            </Col>
          )}
          {(isOneOff || target.kind === "supplierMonth") && (
            <Col md={6}>
              <SelectField
                label="Mês"
                value={state.month}
                options={monthOptions}
                onChange={(value) => set("month", value)}
                error={errors.month}
                disabled={pending}
              />
            </Col>
          )}
          {perVehicle && supplier && (
            <Col md={6}>
              <SelectField
                label="Veículo"
                value={state.vehicleId}
                options={supplier.vehicles.map((link) => ({
                  value: link.vehicle.id,
                  label: `${link.vehicle.plate} · ${link.vehicle.label}`,
                }))}
                onChange={(value) => {
                  set("vehicleId", value);
                  const link = supplier.vehicles.find((l) => l.vehicle.id === value);
                  if (link && isForeign) {
                    set("foreignAmount", link.monthlyAmount);
                    set("amountTouched", false);
                  } else if (link) set("amount", link.monthlyAmount);
                }}
                error={errors.vehicleId}
                disabled={pending}
              />
            </Col>
          )}
          {isOneOff && (
            <Col md={6}>
              <RemoteCombobox
                label="Veículo (opcional)"
                value={picked?.value ?? state.vehicleId}
                selectedLabel={
                  picked?.label ??
                  (item?.vehicle ? `${item.vehicle.plate} · ${item.vehicle.label}` : undefined)
                }
                options={picker.options}
                isLoading={picker.isLoading}
                search={picker.search}
                onSearchChange={picker.setSearch}
                onChange={(option) => {
                  setPicked(option);
                  setErrors({});
                }}
                placeholder="Nenhum"
                searchPlaceholder="Placa, marca ou modelo…"
                error={errors.vehicleId}
              />
            </Col>
          )}
          <Col md={6}>
            <SelectField
              label="Situação"
              value={state.status}
              options={statusOptions}
              onChange={(value) => set("status", value as ExpenseStatus)}
              error={errors.status}
              disabled={pending}
            />
          </Col>
          {isOneOff && (
            <Col md={6}>
              <SelectField
                label="Moeda"
                value={state.currency}
                options={options(LABEL_MAPS.currency)}
                onChange={(value) => {
                  set("currency", value as Currency);
                  set("amountTouched", false);
                }}
                error={errors.currency}
                disabled={pending}
              />
            </Col>
          )}
          {state.status !== "WAIVED" && isForeign && (
            <Col md={6}>
              <MoneyField
                label={`Valor em ${currencySymbol(state.currency)}`}
                value={state.foreignAmount}
                onChange={(value) => {
                  set("foreignAmount", value);
                  set("amountTouched", false);
                }}
                error={errors.foreignAmount}
                currency={state.currency}
              />
            </Col>
          )}
          {state.status !== "WAIVED" && (
            <Col md={6}>
              <MoneyField
                label={
                  isForeign
                    ? "Valor em R$ (o que saiu)"
                    : state.status === "PAID"
                      ? "Valor pago"
                      : "Valor da conta"
                }
                value={amount}
                onChange={(value) => {
                  set("amount", value);
                  set("amountTouched", true);
                }}
                error={errors.amount}
                hint={
                  isForeign
                    ? state.amountTouched
                      ? "Como veio na fatura."
                      : quote.data?.conversion
                        ? `${conversionNote(quote.data.conversion)}. Ajuste pelo valor da fatura.`
                        : "Estimativa pela cotação do dia. Ajuste pelo valor da fatura."
                    : undefined
                }
              />
            </Col>
          )}
          <PaymentMethodFields
            method={state.paymentMethod}
            cardId={state.paymentCardId}
            onMethodChange={(value) => set("paymentMethod", value)}
            onCardChange={(value) => set("paymentCardId", value)}
            errors={errors}
            disabled={pending}
          />
          {state.status === "PAID" && (
            <Col md={6}>
              <DateField
                label="Dia do pagamento"
                value={state.paidAt}
                onChange={(value) => set("paidAt", value)}
                error={errors.paidAt}
              />
            </Col>
          )}
          <Col>
            <TextareaField
              label="Observação (opcional)"
              rows={2}
              value={state.notes}
              onChange={(event) => set("notes", event.target.value)}
              error={errors.notes}
              maxLength={2000}
            />
          </Col>
          <Col>
            <FilePicker
              label="Anexar comprovante"
              files={receipts}
              onChange={setReceipts}
              disabled={pending}
            />
          </Col>
        </Row>
        {expenseId && recorded.data && recorded.data.documents.length > 0 && (
          <DocumentsCard
            title="Comprovantes"
            documents={recorded.data.documents}
            manage={{
              owner: { type: "EXPENSE", id: expenseId },
              invalidate: queryKeys.expenses.all,
            }}
          />
        )}
        {errors.form && <Alert>{errors.form}</Alert>}
        <DialogFooter className="gap-2 sm:justify-between">
          {expenseId ? (
            <ConfirmDialog
              destructive
              trigger={
                <Button type="button" variant="ghost" disabled={pending}>
                  <Trash2 />
                  Excluir lançamento
                </Button>
              }
              title="Excluir lançamento?"
              description={
                isOneOff
                  ? "A despesa e os comprovantes dela saem do sistema."
                  : "O mês volta a ficar em aberto e os comprovantes saem do sistema."
              }
              confirmLabel="Excluir"
              onConfirm={onDelete}
              isPending={remove.isPending}
            />
          ) : (
            <Box />
          )}
          <Box className="flex flex-col-reverse gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {save.isPending && <Spinner className="text-primary-foreground" />}
              Salvar
            </Button>
          </Box>
        </DialogFooter>
      </Form>
    </>
  );
}
