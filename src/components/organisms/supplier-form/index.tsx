import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { PaymentMethodFields } from "@/components/organisms/payment-method-fields";
import {
  NONE,
  SUPPLIER_FORM_FIELDS,
  supplierFormDefaults,
  supplierFormSchema,
  toSupplierInput,
  type SupplierFormInput,
  type SupplierFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { conversionNote, brlEstimate } from "@/helpers/currency";
import { applyApiErrors } from "@/helpers/form";
import { useExchangeQuote } from "@/hooks/api/gestao/exchange-rates/useExchangeQuote";
import { useSaveSupplier } from "@/hooks/api/gestao/suppliers/useSaveSupplier";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ExpensePaymentMethod } from "@/types/currency";
import type { SupplierDetail } from "@/types/supplier";
import { addMonths, currentMonth, formatMonth, monthsBetween } from "@/utils/month";

const DUE_DAYS = [
  { value: NONE, label: "Não sei" },
  ...Array.from({ length: 31 }, (_, index) => ({
    value: String(index + 1),
    label: `Dia ${index + 1}`,
  })),
];

/** Months to pick from, newest first, plus the "no value" entry. */
function monthOptions(from: string, to: string, none: string, keep: string) {
  const months = monthsBetween(from, to);
  // A saved month outside the window still shows.
  if (keep !== NONE && !months.includes(keep)) months.push(keep);
  return [
    { value: NONE, label: none },
    ...months.map((month) => ({ value: month, label: formatMonth(month) })),
  ];
}

type SupplierFormProps = {
  supplier?: SupplierDetail;
  cancelTo: string;
  onSaved: (supplier: SupplierDetail) => void;
};

export function SupplierForm({
  supplier,
  cancelTo,
  onSaved,
}: SupplierFormProps) {
  const save = useSaveSupplier(supplier?.id);
  const { options } = useLabels();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<SupplierFormInput, unknown, SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplierFormDefaults(supplier),
  });
  const isVehicle = watch("scope") === "VEHICLE";
  const currency = watch("currency");
  const paymentMethod = watch("paymentMethod");
  const paymentCardId = watch("paymentCardId");
  const method =
    paymentMethod === NONE ? null : (paymentMethod as ExpensePaymentMethod);
  // The estimate in reais comes from the server (today's rate + card).
  const quote = useExchangeQuote({
    currency,
    amount: watch("monthlyAmount"),
    paymentMethod: method,
    paymentCardId: paymentCardId === NONE ? null : paymentCardId,
  });
  const estimate =
    currency === "BRL"
      ? undefined
      : quote.data
        ? `${brlEstimate(quote.data.brl)}${
            quote.data.conversion ? ` · ${conversionNote(quote.data.conversion)}` : ""
          }`
        : "O valor em reais sai da cotação do dia.";
  const now = currentMonth();
  const startOptions = monthOptions(
    addMonths(now, -36),
    now,
    "O mês do cadastro",
    supplier?.startsOn ?? NONE,
  );
  const endOptions = monthOptions(
    addMonths(now, -12),
    addMonths(now, 36),
    "Sem fim",
    supplier?.endsOn ?? NONE,
  );

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toSupplierInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, SUPPLIER_FORM_FIELDS)),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Row className="gap-y-4">
            <Col md={6}>
              <FormField
                label="Nome"
                error={errors.name?.message}
                {...register("name")}
              />
            </Col>
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="scope"
                render={({ field }) => (
                  <SelectField
                    label="Escopo"
                    value={field.value}
                    options={options(LABEL_MAPS.supplierScope)}
                    onChange={field.onChange}
                    error={errors.scope?.message}
                    // Once it exists, its months are recorded against it.
                    disabled={Boolean(supplier)}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <SelectField
                    label="Moeda"
                    value={field.value}
                    options={options(LABEL_MAPS.currency)}
                    onChange={field.onChange}
                    error={errors.currency?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="monthlyAmount"
                render={({ field }) => (
                  <MoneyField
                    label={isVehicle ? "Valor padrão / mês" : "Valor / mês"}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.monthlyAmount?.message}
                    currency={currency}
                    hint={estimate}
                  />
                )}
              />
            </Col>
            {isVehicle && (
              <Col md={6} lg={3}>
                <Controller
                  control={control}
                  name="billing"
                  render={({ field }) => (
                    <SelectField
                      label="Como é cobrado"
                      value={field.value}
                      options={options(LABEL_MAPS.supplierBilling)}
                      onChange={field.onChange}
                      error={errors.billing?.message}
                    />
                  )}
                />
              </Col>
            )}
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="dueDay"
                render={({ field }) => (
                  <SelectField
                    label="Vence todo"
                    value={field.value}
                    options={DUE_DAYS}
                    onChange={field.onChange}
                    error={errors.dueDay?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="startsOn"
                render={({ field }) => (
                  <SelectField
                    label="Desde"
                    value={field.value}
                    options={startOptions}
                    onChange={field.onChange}
                    error={errors.startsOn?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="endsOn"
                render={({ field }) => (
                  <SelectField
                    label="Vale até"
                    value={field.value}
                    options={endOptions}
                    onChange={field.onChange}
                    error={errors.endsOn?.message}
                  />
                )}
              />
            </Col>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Controller
                  control={control}
                  name="paymentCardId"
                  render={({ field: card }) => (
                    <PaymentMethodFields
                      cols={{ md: 6, lg: 3 }}
                      method={field.value === NONE ? null : (field.value as ExpensePaymentMethod)}
                      cardId={card.value === NONE ? null : card.value}
                      onMethodChange={(value) => field.onChange(value ?? NONE)}
                      onCardChange={(value) => card.onChange(value ?? NONE)}
                      errors={{
                        paymentMethod: errors.paymentMethod?.message,
                        paymentCardId: errors.paymentCardId?.message,
                      }}
                    />
                  )}
                />
              )}
            />
            <Col>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <CheckboxField
                    label="Ativo"
                    hint="Custo fixo inativo não entra na projeção."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
          </Row>

          <Alert variant="info" role="note">
            {isVehicle
              ? "Por veículo, o valor acima é o padrão para novos veículos: o que conta é o valor de cada veículo vinculado. "
              : ""}
            {currency !== "BRL"
              ? "Em outra moeda, a projeção e as contas usam a cotação do dia (mais o acréscimo do cartão, se for pago com cartão); ao registrar o pagamento, vale o que saiu em reais. "
              : ""}
            Desde o mês em “Desde”, o custo aparece todo mês em Financeiro ›
            Contas do mês para registrar o pagamento.
          </Alert>
          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {supplier ? "Salvar alterações" : "Cadastrar custo fixo"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function SupplierFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Row className="gap-y-4">
          {([6, 3, 3, 3, 3, 3, 3, 3, 3] as const).map((lg, index) => (
            <Col key={index} md={6} lg={lg} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
          <Col>
            <Skeleton shape="text" className="w-40 text-sm" />
          </Col>
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-40 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
