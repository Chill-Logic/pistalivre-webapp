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
import { Box } from "@/components/atoms/box";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { InstallmentComposer } from "@/components/organisms/installment-composer";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import {
  isNotRecorded,
  itemFieldErrors,
  moneyErrorMessage,
} from "@/helpers/money-errors";
import { useCautionPlan } from "@/hooks/api/gestao/charges/useCautionPlan";
import {
  useCreateCautionCharges,
  useCreateInstallmentCharges,
  useCreateRentalCharge,
} from "@/hooks/api/gestao/charges/useChargeMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  ChargeBatchResult,
  ChargeMethod,
  ChargePlanItem,
  ChargePurpose,
} from "@/types/charge";
import type { RatePeriod } from "@/types/rental";
import { formatCurrency } from "@/utils/format";

/** House defaults (management app): 10% fine, 1% interest a month. */
const DEFAULT_FINE = "10";
const DEFAULT_INTEREST = "1";

const PURPOSES: ChargePurpose[] = [
  "CAUTION",
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
 * Issue charges on the rental, three ways (as the management app):
 * - one charge;
 * - "Parcelar": N independent charges split by the server;
 * - Caução: the deposit the rental's settings imply (dates editable;
 *   the ones already charged are skipped).
 * The description is the standard one (purpose, vehicle, plate, code),
 * built by the server; only "Outro" takes free text. Daily rent goes
 * without fine/interest (house rule, server side). A batch that half fails
 * (207) keeps the dialog open: sending again skips what already went out.
 */
export function ChargeFormDialog({
  rentalId,
  rate,
  ratePeriod,
}: ChargeFormDialogProps) {
  const { label } = useLabels();
  const create = useCreateRentalCharge(rentalId);
  const createCaution = useCreateCautionCharges(rentalId);
  const createInstallments = useCreateInstallmentCharges(rentalId);
  const idempotency = useIdempotencyKey();
  const [open, setOpen] = useState(false);
  const [split, setSplit] = useState(false);
  const [installments, setInstallments] = useState<ChargePlanItem[]>([]);
  const [composerKey, setComposerKey] = useState(0);
  const [cautionDates, setCautionDates] = useState<Record<number, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [partial, setPartial] = useState<string | null>(null);
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
  const isCaution = purpose === "CAUTION";
  const cautionPlan = useCautionPlan(rentalId, open && isCaution);
  const pending =
    create.isPending || createCaution.isPending || createInstallments.isPending;
  const mode = isCaution ? "caution" : split ? "installments" : "single";

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
    setSplit(false);
    setInstallments([]);
    setComposerKey((key) => key + 1);
    setCautionDates({});
    setItemErrors({});
    setPartial(null);
  };

  const onOpenChange = (next: boolean) => {
    if (pending) return;
    setOpen(next);
    if (next) reset();
  };

  const changePurpose = (next: string) => {
    const value = next as ChargePurpose;
    setPurpose(value);
    setAmount(value === "RENT" ? rate : null);
    setDuplicate(null);
    setErrors({});
    setItemErrors({});
    setPartial(null);
  };

  const surcharge = () =>
    surchargeFree
      ? {}
      : {
          finePercent: Number(fine.replace(",", ".")) || 0,
          interestPercent: Number(interest.replace(",", ".")) || 0,
        };

  /** Shared by the batch modes: 207 keeps the dialog, the rest closes it. */
  const batchHandlers = {
    onSuccess: (result: ChargeBatchResult) => {
      idempotency.renew();
      if (result.code === "PARTIAL" && result.failed?.length) {
        setPartial(
          result.failed
            .map((fail) => `Parcela ${fail.index + 1}: ${fail.message}`)
            .join(" · "),
        );
        return;
      }
      setOpen(false);
    },
    onError: (error: unknown) => {
      const apiError = toApiError(error);
      if (isNotRecorded(error)) setBlocked(true);
      const perItem = itemFieldErrors(apiError.fields);
      setItemErrors(perItem);
      setErrors(
        Object.keys(perItem).length > 0
          ? { form: "Corrija as datas marcadas." }
          : { form: moneyErrorMessage(error) },
      );
    },
  };

  const cautionItems = (cautionPlan.data ?? [])
    .map((item, index) => ({ ...item, index }))
    .filter((item) => !item.emitted);

  const submitBatch = () => {
    setPartial(null);
    setItemErrors({});
    if (mode === "caution") {
      if (cautionItems.length === 0) return;
      createCaution.mutate(
        {
          key: idempotency.key,
          input: {
            method,
            ...surcharge(),
            items: cautionItems.map((item) => ({
              label: item.label,
              amount: item.amount,
              dueDate: cautionDates[item.index] ?? item.dueDate,
            })),
          },
        },
        batchHandlers,
      );
      return;
    }
    if (purpose === "OTHER" && !description.trim()) {
      setErrors({ description: "Descreva a cobrança" });
      return;
    }
    if (installments.length === 0) {
      setErrors({ form: "Monte as parcelas antes de emitir." });
      return;
    }
    createInstallments.mutate(
      {
        key: idempotency.key,
        input: {
          purpose: purpose as Exclude<ChargePurpose, "CAUTION">,
          method,
          ...surcharge(),
          ...(purpose === "OTHER" ? { description: description.trim() } : {}),
          items: installments,
        },
      },
      batchHandlers,
    );
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
          ...surcharge(),
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
    if (mode === "single") submit(false);
    else submitBatch();
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
                disabled={pending}
              />
            </Col>
            <Col md={6}>
              <SelectField
                label="Forma"
                value={method}
                options={options(METHODS, LABEL_MAPS.paymentMethod)}
                onChange={(value) => setMethod(value as ChargeMethod)}
                disabled={pending}
              />
            </Col>
            {!isCaution && (
              <Col>
                <CheckboxField
                  label="Parcelar em várias vezes"
                  hint="Cada parcela vira uma cobrança separada."
                  checked={split}
                  onChange={(checked) => {
                    setSplit(checked);
                    setErrors({});
                    setItemErrors({});
                    setPartial(null);
                  }}
                  disabled={pending}
                />
              </Col>
            )}
            {mode === "single" && (
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
              </>
            )}
            {mode === "installments" && (
              <Col>
                <InstallmentComposer
                  key={composerKey}
                  onItemsChange={setInstallments}
                  itemErrors={itemErrors}
                  disabled={pending}
                />
              </Col>
            )}
            {mode === "caution" && (
              <Col>
                <CautionPlanFields
                  isPending={cautionPlan.isPending}
                  isError={cautionPlan.isError}
                  items={cautionPlan.data ?? []}
                  dates={cautionDates}
                  onDateChange={(index, value) =>
                    setCautionDates((current) => ({
                      ...current,
                      [index]: value,
                    }))
                  }
                  itemErrors={itemErrors}
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
          {partial && (
            <Alert variant="warning">
              Algumas não saíram: {partial}. Corrija e envie de novo: as que já
              saíram são puladas.
            </Alert>
          )}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            {duplicate && mode === "single" && (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => submit(true)}
              >
                Emitir mesmo assim
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                pending ||
                blocked ||
                (mode === "caution" && cautionItems.length === 0) ||
                (mode === "installments" && installments.length === 0)
              }
            >
              {pending && <Spinner className="text-primary-foreground" />}
              {mode === "caution"
                ? `Emitir caução (${cautionItems.length})`
                : mode === "installments"
                  ? `Emitir ${installments.length} ${installments.length === 1 ? "parcela" : "parcelas"}`
                  : "Emitir cobrança"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type CautionPlanFieldsProps = {
  isPending: boolean;
  isError: boolean;
  items: { label: string; amount: number; dueDate: string; emitted: boolean }[];
  dates: Record<number, string>;
  onDateChange: (index: number, value: string) => void;
  itemErrors: Record<number, string>;
};

/** The deposit plan: each charge with its (editable) due date. */
function CautionPlanFields({
  isPending,
  isError,
  items,
  dates,
  onDateChange,
  itemErrors,
}: CautionPlanFieldsProps) {
  if (isPending) {
    return (
      <Box className="space-y-2" aria-busy>
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </Box>
    );
  }
  if (isError) return <Alert>Não foi possível carregar a caução.</Alert>;
  if (items.length === 0) {
    return (
      <Text tone="muted">
        Esta locação não tem caução configurada. Edite a locação para definir o
        tipo e o valor.
      </Text>
    );
  }
  // Index in the `items` sent = position among the ones not yet charged.
  let sentIndex = -1;
  return (
    <Box className="space-y-3">
      <Text weight="medium">Cobranças da caução ({items.length})</Text>
      {items.map((item, index) => {
        if (item.emitted) {
          return (
            <Text key={index} size="sm" tone="muted">
              {item.label} · {formatCurrency(item.amount)} · já emitida
            </Text>
          );
        }
        sentIndex += 1;
        return (
          <DateField
            key={index}
            label={`${item.label} · ${formatCurrency(item.amount)}`}
            value={dates[index] ?? item.dueDate}
            onChange={(value) => onDateChange(index, value)}
            error={itemErrors[sentIndex]}
          />
        );
      })}
    </Box>
  );
}
