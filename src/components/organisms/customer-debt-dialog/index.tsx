import { Pencil, Plus } from "lucide-react";
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
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useSaveCustomerDebt } from "@/hooks/api/gestao/customer-debts/useCustomerDebts";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CustomerDebt, CustomerDebtOrigin } from "@/types/customer-debt";
import { calendarDay, todayInBrasilia } from "@/utils/date";

const ORIGINS: CustomerDebtOrigin[] = [
  "DAMAGES",
  "TRAFFIC_FINE",
  "CLAIM",
  "SETTLEMENT",
  "OTHER",
];

type Errors = Partial<
  Record<
    "origin" | "description" | "amount" | "incurredAt" | "startsAt" | "notes",
    string
  >
> & { form?: string };

type CustomerDebtDialogProps = {
  customerId: string;
  /** Present = edit. */
  debt?: CustomerDebt;
};

/**
 * What the customer owes the company. It is paid down by the part of the
 * daily rent set aside for debts (in the rental's values) or directly.
 */
export function CustomerDebtDialog({
  customerId,
  debt,
}: CustomerDebtDialogProps) {
  const { label } = useLabels();
  const save = useSaveCustomerDebt(customerId, debt?.id);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<CustomerDebtOrigin>("DAMAGES");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [incurredAt, setIncurredAt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (save.isPending) return;
    setOpen(next);
    if (!next) return;
    const today = todayInBrasilia();
    setOrigin(debt?.origin ?? "DAMAGES");
    setDescription(debt?.description ?? "");
    setAmount(debt?.amount ?? null);
    setIncurredAt(debt ? calendarDay(debt.incurredAt) : today);
    setStartsAt(debt ? calendarDay(debt.startsAt) : today);
    setNotes(debt?.notes ?? "");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!amount || amount <= 0) next.amount = "Informe o valor";
    if (!incurredAt) next.incurredAt = "Informe o dia do fato";
    if (!startsAt) next.startsAt = "Informe desde quando abate";
    setErrors(next);
    if (Object.keys(next).length > 0 || !amount) return;
    save.mutate(
      {
        origin,
        description: description.trim() || null,
        amount,
        incurredAt,
        startsAt,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const placed = Object.keys(fields).length > 0;
          setErrors({ ...fields, form: placed ? undefined : apiError.message });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {debt ? (
          <Button variant="ghost" size="icon" aria-label="Editar débito">
            <Pencil />
          </Button>
        ) : (
          <Button size="sm">
            <Plus />
            Registrar débito
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{debt ? "Editar débito" : "Registrar débito"}</DialogTitle>
        <DialogDescription>
          O que o cliente deve à locadora. Ele paga com a parte da diária
          separada para débitos (nos valores da locação) ou à vista.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6}>
              <SelectField
                label="Origem"
                value={origin}
                options={ORIGINS.map((key) => ({
                  value: key,
                  label: label(LABEL_MAPS.customerDebtOrigin, key),
                }))}
                onChange={(value) => setOrigin(value as CustomerDebtOrigin)}
                error={errors.origin}
                disabled={save.isPending}
              />
            </Col>
            <Col md={6}>
              <MoneyField
                label="Valor total"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  setErrors({});
                }}
                error={errors.amount}
              />
            </Col>
            <Col>
              <FormField
                label="Descrição (aparece para o cliente)"
                placeholder="Ex.: conserto da carenagem"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                error={errors.description}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Dia do fato"
                value={incurredAt}
                onChange={setIncurredAt}
                error={errors.incurredAt}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Abate a partir de"
                value={startsAt}
                onChange={setStartsAt}
                error={errors.startsAt}
              />
            </Col>
            <Col>
              <TextareaField
                label="Observação interna (opcional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                error={errors.notes}
                disabled={save.isPending}
              />
            </Col>
          </Row>
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={save.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {debt ? "Salvar" : "Registrar débito"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
