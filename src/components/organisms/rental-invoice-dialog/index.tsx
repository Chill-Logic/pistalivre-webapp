import { FileText } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useCreateRentalInvoice } from "@/hooks/api/gestao/invoices/useInvoiceMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { InvoiceSuggestions } from "@/types/invoice";
import { todayInBrasilia } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

type Purpose = "RENT" | "CAUTION";

type Errors = { value?: string; effectiveDate?: string; form?: string };

/**
 * Issues the NFS-e of a rental like the management app: rent (pick the
 * month) or deposit. Value and the fixed description come from the server's
 * suggestions; the value stays editable.
 */
export function RentalInvoiceDialog({
  rentalId,
  suggestions,
}: {
  rentalId: string;
  suggestions: InvoiceSuggestions;
}) {
  const { label } = useLabels();
  const create = useCreateRentalInvoice(rentalId);
  const idempotency = useIdempotencyKey();
  const lastMonth =
    suggestions.rentMonths[suggestions.rentMonths.length - 1]?.key ?? "";
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState<Purpose>("RENT");
  const [monthKey, setMonthKey] = useState(lastMonth);
  const [value, setValue] = useState<number | null>(null);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const month = suggestions.rentMonths.find((item) => item.key === monthKey);
  const suggested = (nextPurpose: Purpose, key: string) =>
    nextPurpose === "RENT"
      ? (suggestions.rentMonths.find((item) => item.key === key)?.sum ?? null)
      : suggestions.caution.sum || null;
  const description =
    purpose === "RENT"
      ? (month?.serviceDescription ?? "")
      : suggestions.caution.serviceDescription;
  const noRent = purpose === "RENT" && suggestions.rentMonths.length === 0;

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setPurpose("RENT");
    setMonthKey(lastMonth);
    setValue(suggested("RENT", lastMonth));
    setEffectiveDate(todayInBrasilia());
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!value || value <= 0) next.value = "Informe o valor da NF";
    if (!effectiveDate) next.effectiveDate = "Informe a data de emissão";
    setErrors(next);
    if (Object.keys(next).length > 0 || !value || !description) return;
    create.mutate(
      {
        key: idempotency.key,
        input: { value, serviceDescription: description, effectiveDate },
      },
      {
        onSuccess: () => {
          idempotency.renew();
          setOpen(false);
        },
        onError: (error) => {
          const fields = toApiError(error).fields ?? {};
          setErrors({
            value: fields.value,
            effectiveDate: fields.effectiveDate,
            form:
              fields.value || fields.effectiveDate
                ? undefined
                : moneyErrorMessage(error),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText />
          Emitir NF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Emitir nota fiscal</DialogTitle>
        <DialogDescription>
          A nota é agendada no Asaas e sai autorizada pela prefeitura.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <SelectField
            label="Finalidade"
            value={purpose}
            options={(["RENT", "CAUTION"] as const).map((key) => ({
              value: key,
              label: label(LABEL_MAPS.paymentPurpose, key),
            }))}
            onChange={(next) => {
              const nextPurpose = next as Purpose;
              setPurpose(nextPurpose);
              setValue(suggested(nextPurpose, monthKey));
              setErrors({});
            }}
            disabled={create.isPending}
          />
          {purpose === "RENT" &&
            (noRent ? (
              <Text tone="muted">
                Não há cobranças de aluguel nesta locação para faturar.
              </Text>
            ) : (
              <SelectField
                label="Mês de competência"
                value={monthKey}
                options={suggestions.rentMonths.map((item) => ({
                  value: item.key,
                  label: `${item.label} — ${formatCurrency(item.sum)}`,
                }))}
                onChange={(key) => {
                  setMonthKey(key);
                  setValue(suggested("RENT", key));
                  setErrors({});
                }}
                disabled={create.isPending}
              />
            ))}
          <MoneyField
            label="Valor da NF"
            value={value}
            onChange={(next) => {
              setValue(next);
              setErrors({});
            }}
            error={errors.value}
          />
          <DateField
            label="Data de emissão"
            value={effectiveDate}
            onChange={(next) => {
              setEffectiveDate(next);
              setErrors({});
            }}
            error={errors.effectiveDate}
          />
          {description && (
            <Box className="rounded-md bg-muted px-3 py-2">
              <Text size="xs" tone="muted">
                Descrição do serviço (automática)
              </Text>
              <Text size="sm" className="whitespace-pre-line break-words">
                {description}
              </Text>
            </Box>
          )}
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
            <Button type="submit" disabled={create.isPending || noRent}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Emitir NF
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
