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
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { isNotRecorded, moneyErrorMessage } from "@/helpers/money-errors";
import { useCreateRentalCharge } from "@/hooks/api/gestao/charges/useChargeMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ChargeMethod, ChargePurpose } from "@/types/charge";
import type { RatePeriod } from "@/types/rental";

/** House defaults (management app): 10% fine, 1% interest a month. */
const DEFAULT_FINE = "10";
const DEFAULT_INTEREST = "1";

const PURPOSES: ChargePurpose[] = [
  "RENT",
  "FINE",
  "DAMAGES",
  "SETTLEMENT",
  "CLAIM",
  "OTHER",
];
const METHODS: ChargeMethod[] = ["PIX", "BOLETO"];

type ChargeFormDialogProps = {
  rentalId: string;
  rate: number;
  ratePeriod: RatePeriod;
};

type Errors = Partial<
  Record<
    | "amount"
    | "dueDate"
    | "referenceDate"
    | "finePercent"
    | "interestPercent"
    | "description",
    string
  >
> & { form?: string };

/**
 * Issue one charge on the rental. The description is the standard one
 * (purpose, vehicle, plate, code), built by the server; only "Outro" takes
 * free text. Daily rent goes without fine/interest (house rule, server side).
 */
export function ChargeFormDialog({
  rentalId,
  rate,
  ratePeriod,
}: ChargeFormDialogProps) {
  const { label } = useLabels();
  const create = useCreateRentalCharge(rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState<ChargePurpose>("RENT");
  const [method, setMethod] = useState<ChargeMethod>("PIX");
  const [amount, setAmount] = useState<number | null>(rate);
  const [dueDate, setDueDate] = useState("");
  const [referenceDate, setReferenceDate] = useState("");
  const [fine, setFine] = useState(DEFAULT_FINE);
  const [interest, setInterest] = useState(DEFAULT_INTEREST);
  const [description, setDescription] = useState("");
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [blocked, setBlocked] = useState(false);

  const surchargeFree = purpose === "RENT" && ratePeriod === "DAILY";

  const reset = () => {
    setPurpose("RENT");
    setMethod("PIX");
    setAmount(rate);
    setDueDate("");
    setReferenceDate("");
    setFine(DEFAULT_FINE);
    setInterest(DEFAULT_INTEREST);
    setDescription("");
    setDuplicate(null);
    setErrors({});
    setBlocked(false);
  };

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (next) reset();
  };

  const changePurpose = (next: string) => {
    const value = next as ChargePurpose;
    setPurpose(value);
    setAmount(value === "RENT" ? rate : null);
    setDuplicate(null);
    setErrors({});
  };

  const submit = (confirmDuplicate: boolean) => {
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor";
    if (!dueDate) next.dueDate = "Informe o vencimento";
    if (purpose === "OTHER" && !description.trim()) {
      next.description = "Descreva a cobrança";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;

    create.mutate(
      {
        key: idempotency.key,
        input: {
          purpose,
          method,
          amount,
          dueDate,
          ...(surchargeFree
            ? {}
            : {
                finePercent: Number(fine.replace(",", ".")) || 0,
                interestPercent: Number(interest.replace(",", ".")) || 0,
              }),
          ...(purpose === "RENT" && referenceDate ? { referenceDate } : {}),
          ...(purpose === "OTHER" ? { description: description.trim() } : {}),
          ...(confirmDuplicate ? { confirmDuplicate: true } : {}),
        },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.code === "DUPLICATE_RENT") {
            setDuplicate(apiError.message);
            return;
          }
          if (isNotRecorded(error)) setBlocked(true);
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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(false);
  };

  const options = (keys: string[], map: LabelMapName) =>
    keys.map((key) => ({ value: key, label: label(map, key) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova cobrança
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Nova cobrança</DialogTitle>
        <DialogDescription>
          Sai pelo Asaas, com fatura e pix para o cliente.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6}>
              <SelectField
                label="Finalidade"
                value={purpose}
                options={options(PURPOSES, LABEL_MAPS.paymentPurpose)}
                onChange={changePurpose}
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
                  setDuplicate(null);
                  setErrors({});
                }}
                error={errors.dueDate}
              />
            </Col>
            {purpose === "RENT" && (
              <Col>
                <DateField
                  label="Referente a (se for de outro dia)"
                  placeholder="O mesmo do vencimento"
                  value={referenceDate}
                  onChange={setReferenceDate}
                  error={errors.referenceDate}
                  clearable
                />
              </Col>
            )}
            {surchargeFree ? (
              <Col>
                <Text size="xs" tone="muted">
                  Aluguel na diária não tem multa nem juros.
                </Text>
              </Col>
            ) : (
              <>
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
              </>
            )}
            {purpose === "OTHER" ? (
              <Col>
                <TextareaField
                  label="Descrição"
                  placeholder="O que está sendo cobrado"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setErrors({});
                  }}
                  error={errors.description}
                />
              </Col>
            ) : (
              <Col>
                <Text size="xs" tone="muted">
                  A descrição é a padrão: finalidade, veículo, placa e código da
                  locação.
                </Text>
              </Col>
            )}
          </Row>
          {duplicate && <Alert variant="warning">{duplicate}</Alert>}
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
            {duplicate && (
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
                onClick={() => submit(true)}
              >
                Emitir mesmo assim
              </Button>
            )}
            <Button type="submit" disabled={create.isPending || blocked}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Emitir cobrança
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
