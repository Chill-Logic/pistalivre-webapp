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
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { InstallmentComposer } from "@/components/organisms/installment-composer";
import {
  CustomerRentalPicker,
  type CustomerRentalValue,
} from "@/components/organisms/customer-rental-picker";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { itemFieldErrors, moneyErrorMessage } from "@/helpers/money-errors";
import { useCreateStandaloneCharge } from "@/hooks/api/gestao/charges/useStandaloneChargeMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  ChargeMethod,
  ChargePlanItem,
  ChargePurpose,
} from "@/types/charge";

/** House defaults (management app): 10% fine, 1% interest a month. */
const DEFAULT_FINE = "10";
const DEFAULT_INTEREST = "1";

const PURPOSES: ChargePurpose[] = [
  "RENT",
  "CAUTION",
  "DAMAGES",
  "SETTLEMENT",
  "CLAIM",
  "OTHER",
];
const METHODS: ChargeMethod[] = ["PIX", "BOLETO"];

type StandaloneChargeDialogProps = {
  /** Fixed customer (customer record). Omit to pick one (Financeiro). */
  customer?: { id: string; name: string };
};

type Errors = Partial<
  Record<
    | "customerId"
    | "rentalId"
    | "amount"
    | "dueDate"
    | "finePercent"
    | "interestPercent"
    | "description",
    string
  >
> & { form?: string };

/**
 * Issues a charge at Asaas for a customer, with or without a rental. With a
 * rental (and a purpose other than "Outro") the server uses the rental's
 * standard description; otherwise the free text.
 */
export function StandaloneChargeDialog({
  customer,
}: StandaloneChargeDialogProps) {
  const { label } = useLabels();
  const create = useCreateStandaloneCharge();
  const idempotency = useIdempotencyKey();
  const blank: CustomerRentalValue = {
    customerId: customer?.id ?? "",
    customerName: customer?.name ?? "",
    rentalId: "",
  };
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(blank);
  const [purpose, setPurpose] = useState<ChargePurpose>("OTHER");
  const [method, setMethod] = useState<ChargeMethod>("PIX");
  const [amount, setAmount] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [fine, setFine] = useState(DEFAULT_FINE);
  const [interest, setInterest] = useState(DEFAULT_INTEREST);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [blocked, setBlocked] = useState(false);
  const [split, setSplit] = useState(false);
  const [composerKey, setComposerKey] = useState(0);
  const [installments, setInstallments] = useState<ChargePlanItem[]>([]);
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [partial, setPartial] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setTarget(blank);
    setPurpose("OTHER");
    setMethod("PIX");
    setAmount(null);
    setDueDate("");
    setFine(DEFAULT_FINE);
    setInterest(DEFAULT_INTEREST);
    setDescription("");
    setErrors({});
    setBlocked(false);
    setSplit(false);
    setComposerKey((key) => key + 1);
    setInstallments([]);
    setItemErrors({});
    setPartial(null);
  };

  const freeText = purpose === "OTHER" || !target.rentalId;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!target.customerId) next.customerId = "Escolha o cliente";
    if (!split && (!amount || amount <= 0)) next.amount = "Informe o valor";
    if (!split && !dueDate) next.dueDate = "Informe o vencimento";
    if (split && installments.length === 0) {
      next.form = "Monte as parcelas antes de emitir.";
    }
    if (purpose === "OTHER" && !description.trim()) {
      next.description = "Descreva a cobrança";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setItemErrors({});
    setPartial(null);

    create.mutate(
      {
        key: idempotency.key,
        input: {
          customerId: target.customerId,
          ...(target.rentalId ? { rentalId: target.rentalId } : {}),
          purpose,
          method,
          ...(split
            ? { items: installments }
            : { amount: amount ?? 0, dueDate }),
          finePercent: Number(fine.replace(",", ".")) || 0,
          interestPercent: Number(interest.replace(",", ".")) || 0,
          ...(freeText && description.trim()
            ? { description: description.trim() }
            : {}),
        },
      },
      {
        onSuccess: (result) => {
          idempotency.renew();
          if (result.code === "PARTIAL" && result.failed?.length) {
            // Sending the batch again would duplicate what was issued.
            setBlocked(true);
            setPartial(
              `${result.created.length} emitidas; não saíram: ${result.failed
                .map((fail) => `parcela ${fail.index + 1} (${fail.message})`)
                .join(", ")}. Emita essas à parte, uma a uma.`,
            );
            return;
          }
          setOpen(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.code === "NOT_RECORDED") setBlocked(true);
          const perItem = itemFieldErrors(apiError.fields);
          setItemErrors(perItem);
          if (Object.keys(perItem).length > 0) {
            setErrors({ form: "Corrija as parcelas marcadas." });
            return;
          }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Emitir cobrança
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Emitir cobrança</DialogTitle>
        <DialogDescription>
          Sai pelo Asaas, com fatura e pix. A locação é opcional.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
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
            <Col>
              <CheckboxField
                label="Parcelar em várias vezes"
                hint="Cada parcela vira uma cobrança separada."
                checked={split}
                onChange={(checked) => {
                  setSplit(checked);
                  setErrors({});
                }}
                disabled={create.isPending}
              />
            </Col>
            {split ? (
              <Col>
                <InstallmentComposer
                  key={composerKey}
                  onItemsChange={setInstallments}
                  itemErrors={itemErrors}
                  disabled={create.isPending}
                />
              </Col>
            ) : (
              <>
                <Col md={6}>
                  <MoneyField
                    label="Valor"
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
                    label="Vencimento"
                    value={dueDate}
                    onChange={(value) => {
                      setDueDate(value);
                      setErrors({});
                    }}
                    error={errors.dueDate}
                  />
                </Col>
              </>
            )}
            <Col span={6}>
              <FormField
                label="Multa (%)"
                inputMode="decimal"
                value={fine}
                onChange={(event) => setFine(event.target.value)}
                error={errors.finePercent}
              />
            </Col>
            <Col span={6}>
              <FormField
                label="Juros (% ao mês)"
                inputMode="decimal"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                error={errors.interestPercent}
              />
            </Col>
          </Row>
          {freeText ? (
            <TextareaField
              label={purpose === "OTHER" ? "Descrição" : "Descrição (opcional)"}
              placeholder="Ex.: taxa de limpeza"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors({});
              }}
              error={errors.description}
              disabled={create.isPending}
            />
          ) : (
            <Text size="xs" tone="muted">
              A descrição é a padrão da locação: finalidade, veículo, placa e
              código.
            </Text>
          )}
          {partial && <Alert variant="warning">{partial}</Alert>}
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
              {split && installments.length > 0
                ? `Emitir ${installments.length} ${installments.length === 1 ? "parcela" : "parcelas"}`
                : "Emitir cobrança"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
