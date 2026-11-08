import { HandCoins } from "lucide-react";
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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  CustomerRentalPicker,
  type CustomerRentalValue,
} from "@/components/organisms/customer-rental-picker";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useCreateManualCharge } from "@/hooks/api/gestao/charges/useStandaloneChargeMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ChargeMethod, ChargePurpose } from "@/types/charge";
import { todayInBrasilia } from "@/utils/date";

const PURPOSES: ChargePurpose[] = [
  "RENT",
  "CAUTION",
  "DAMAGES",
  "SETTLEMENT",
  "FINE",
  "CLAIM",
  "OTHER",
];
const METHODS: ChargeMethod[] = ["PIX", "BOLETO"];

type ManualPaymentDialogProps = {
  /** Fixed customer (rental/customer record). Omit to pick one. */
  customer?: { id: string; name: string };
  /** Fixed rental (rental record). Omit to pick among the customer's. */
  rentalId?: string;
  triggerVariant?: "default" | "outline";
};

type Field =
  | "customerId"
  | "rentalId"
  | "amount"
  | "dueDate"
  | "paidValue"
  | "paidAt"
  | "label";
type Errors = Partial<Record<Field, string>> & { form?: string };

/**
 * A payment that did NOT go through Asaas (pix straight to our account).
 * The four numbers the metrics need: how much and when it was owed, how much
 * and when it was paid. Unchecking "já recebi" records only the debt (open,
 * settled later with "Dar baixa"). Nothing goes to the gateway.
 */
export function ManualPaymentDialog({
  customer,
  rentalId,
  triggerVariant = "outline",
}: ManualPaymentDialogProps) {
  const { label } = useLabels();
  const create = useCreateManualCharge();
  const idempotency = useIdempotencyKey();
  const blank: CustomerRentalValue = {
    customerId: customer?.id ?? "",
    customerName: customer?.name ?? "",
    rentalId: rentalId ?? "",
  };
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(blank);
  const [purpose, setPurpose] = useState<ChargePurpose>("RENT");
  const [method, setMethod] = useState<ChargeMethod>("PIX");
  const [amount, setAmount] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [settled, setSettled] = useState(true);
  const [paidValue, setPaidValue] = useState<number | null>(null);
  const [paidTouched, setPaidTouched] = useState(false);
  const [paidAt, setPaidAt] = useState("");
  const [note, setNote] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [blocked, setBlocked] = useState(false);

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setTarget(blank);
    setPurpose("RENT");
    setMethod("PIX");
    setAmount(null);
    setDueDate("");
    setSettled(true);
    setPaidValue(null);
    setPaidTouched(false);
    setPaidAt(todayInBrasilia());
    setNote("");
    setReceipts([]);
    setErrors({});
    setBlocked(false);
  };

  const paidLess =
    settled && amount != null && paidValue != null && paidValue < amount;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const today = todayInBrasilia();
    const next: Errors = {};
    if (!target.customerId) next.customerId = "Escolha o cliente";
    if (!amount || amount <= 0)
      next.amount = "Informe quanto ele deveria pagar";
    if (!dueDate) next.dueDate = "Informe quando ele deveria pagar";
    if (settled) {
      if (!paidValue || paidValue <= 0)
        next.paidValue = "Informe quanto ele pagou";
      if (!paidAt) next.paidAt = "Informe quando ele pagou";
      else if (paidAt > today) next.paidAt = "A data não pode ser no futuro";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;

    create.mutate(
      {
        key: idempotency.key,
        receipts,
        input: {
          customerId: target.customerId,
          ...(target.rentalId ? { rentalId: target.rentalId } : {}),
          purpose,
          method,
          amount,
          dueDate,
          ...(note.trim() ? { label: note.trim() } : {}),
          settled,
          ...(settled && paidValue ? { paidValue, paidAt } : {}),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.code === "NOT_RECORDED") setBlocked(true);
          const fields = apiError.fields ?? {};
          const placed = Object.keys(fields).length > 0;
          setErrors({
            ...fields,
            form: placed ? undefined : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  const options = (keys: string[], map: LabelMapName) =>
    keys.map((key) => ({ value: key, label: label(map, key) }));
  const showPicker = !customer || !rentalId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <HandCoins />
          Registrar recebimento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Registrar recebimento</DialogTitle>
        <DialogDescription>
          Para pagamentos feitos fora do Asaas (pix direto para a gente). Nada é
          emitido no Asaas, mas conta nas métricas de pagamento e inadimplência.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {showPicker && (
            <CustomerRentalPicker
              value={target}
              onChange={(value) => {
                setTarget(value);
                setErrors({});
              }}
              lockCustomer={Boolean(customer)}
              customerError={errors.customerId}
              rentalError={errors.rentalId}
              disabled={create.isPending}
            />
          )}
          <Row className="gap-y-4">
            <Col md={6}>
              <SelectField
                label="Finalidade"
                value={purpose}
                options={options(PURPOSES, LABEL_MAPS.paymentPurpose)}
                onChange={(value) => setPurpose(value as ChargePurpose)}
                disabled={create.isPending}
              />
            </Col>
            <Col md={6}>
              <SelectField
                label="Forma"
                value={method}
                options={options(METHODS, LABEL_MAPS.paymentMethod)}
                onChange={(value) => setMethod(value as ChargeMethod)}
                disabled={create.isPending}
              />
            </Col>
            <Col md={6}>
              <MoneyField
                label="Quanto deveria pagar"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  // Mirrors the amount until the paid value is typed by hand.
                  if (!paidTouched) setPaidValue(value);
                  setErrors({});
                }}
                error={errors.amount}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Quando deveria pagar"
                value={dueDate}
                onChange={(value) => {
                  setDueDate(value);
                  setErrors({});
                }}
                error={errors.dueDate}
              />
            </Col>
          </Row>
          <CheckboxField
            label="Já recebi este pagamento"
            checked={settled}
            onChange={setSettled}
            disabled={create.isPending}
          />
          {settled ? (
            <Row className="gap-y-4">
              <Col md={6}>
                <MoneyField
                  label="Quanto pagou"
                  value={paidValue}
                  onChange={(value) => {
                    setPaidValue(value);
                    setPaidTouched(true);
                    setErrors({});
                  }}
                  error={errors.paidValue}
                />
              </Col>
              <Col md={6}>
                <DateField
                  label="Quando pagou"
                  value={paidAt}
                  onChange={(value) => {
                    setPaidAt(value);
                    setErrors({});
                  }}
                  error={errors.paidAt}
                />
              </Col>
            </Row>
          ) : (
            <Text size="xs" tone="muted">
              Fica em aberto. Quando o cliente pagar, use “Dar baixa” na
              cobrança.
            </Text>
          )}
          {paidLess && (
            <Alert variant="warning">
              Pagou menos do que devia: a diferença continua em aberto como
              dívida deste cliente.
            </Alert>
          )}
          <FilePicker
            label="Anexar comprovante"
            files={receipts}
            onChange={setReceipts}
          />
          <TextareaField
            label="Observação (opcional)"
            placeholder="Ex.: pix direto na conta C6, comprovante no WhatsApp"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={errors.label}
            disabled={create.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending || blocked}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Registrar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
