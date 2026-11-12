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
import { Heading } from "@/components/atoms/heading";
import { Label } from "@/components/atoms/label";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { Textarea } from "@/components/atoms/textarea";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { CautionInstallmentsEditor } from "@/components/organisms/caution-installments-editor";
import {
  RENTAL_FORM_FIELDS,
  rentalFormDefaults,
  rentalFormSchema,
  toRentalInput,
  type RentalFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSaveRental } from "@/hooks/api/gestao/rentals/useSaveRental";
import { useLabels } from "@/hooks/ui/useLabels";
import { useAiFormFill, type AiFillStep } from "@/hooks/ui/useAiFormFill";
import {
  useCustomerOptions,
  useVehicleOptions,
} from "@/hooks/ui/useRemoteOptions";
import type { RentalDetail, RentalRecord } from "@/types/rental";
import { dayToBrDate } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type RentalFormProps = {
  /** Present = edit (replaces); absent = create. */
  rental?: RentalDetail;
  cancelTo: string;
  onSaved: (rental: RentalRecord) => void;
};

export function RentalForm({ rental, cancelTo, onSaved }: RentalFormProps) {
  const isNew = !rental;
  const save = useSaveRental(rental?.id);
  const { options, label } = useLabels();
  const customers = useCustomerOptions();
  // Only available vehicles; editing also keeps the rental's current one.
  const vehicles = useVehicleOptions({
    status: "AVAILABLE",
    include: rental && {
      value: rental.vehicle.id,
      label: `${formatPlate(rental.vehicle.plate)} · ${rental.vehicle.brand.name} ${rental.vehicle.model.name}`,
      detail: "Veículo atual da locação",
    },
  });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: rentalFormDefaults(rental),
  });

  const ratePeriod = watch("ratePeriod");
  const cautionType = watch("cautionType");
  const cautionTotal = watch("cautionTotal");
  const installments = watch("cautionInstallments");
  const retroactive = watch("retroactive");
  const rowsTotal = installments.reduce(
    (sum, row) => sum + (row.amount ?? 0),
    0,
  );
  const weekdays = options(LABEL_MAPS.weekday);

  // "Preencher na tela" from the chat: field by field, with where each came from.
  const aiFill = useAiFormFill("rental", ({ values: v, origins }) => {
    const steps: AiFillStep[] = [];
    const set = (
      name: keyof RentalFormValues,
      value: RentalFormValues[keyof RentalFormValues],
    ) =>
      setValue(name, value as never, {
        shouldDirty: true,
        shouldValidate: true,
      });
    const add = (
      label: string,
      field: string,
      present: unknown,
      apply: () => void,
      value?: string,
    ) => {
      if (present === null || present === undefined || present === "") return;
      steps.push({ label, origin: origins[field], apply, value });
    };
    const day = (value: unknown) => dayToBrDate(String(value).slice(0, 10));
    const money = (value: unknown) => formatCurrency(Number(value));
    add(
      "Cliente",
      "customerId",
      v.customerId,
      () => {
        set("customerId", String(v.customerId));
        set("customerLabel", String(v.customerLabel ?? ""));
      },
      String(v.customerLabel ?? ""),
    );
    add(
      "Veículo",
      "vehicleId",
      v.vehicleId,
      () => {
        set("vehicleId", String(v.vehicleId));
        set("vehicleLabel", String(v.vehicleLabel ?? ""));
      },
      String(v.vehicleLabel ?? ""),
    );
    add(
      "Início",
      "startDate",
      v.startDate,
      () => set("startDate", String(v.startDate)),
      day(v.startDate),
    );
    add(
      "Fim (opcional)",
      "endDate",
      v.endDate,
      () => set("endDate", String(v.endDate)),
      day(v.endDate),
    );
    add(
      "Valor",
      "rate",
      v.rate,
      () => set("rate", Number(v.rate)),
      money(v.rate),
    );
    add(
      "Periodicidade",
      "ratePeriod",
      v.ratePeriod,
      () =>
        set(
          "ratePeriod",
          String(v.ratePeriod) as RentalFormValues["ratePeriod"],
        ),
      label(LABEL_MAPS.ratePeriod, String(v.ratePeriod)),
    );
    add(
      "Forma de pagamento",
      "paymentMethod",
      v.paymentMethod,
      () => set("paymentMethod", String(v.paymentMethod)),
      label(LABEL_MAPS.paymentMethod, String(v.paymentMethod)),
    );
    add(
      "Dia de cobrança",
      "paymentWeekday",
      v.paymentWeekday,
      () => set("paymentWeekday", String(v.paymentWeekday)),
      label(LABEL_MAPS.weekday, String(v.paymentWeekday)),
    );
    add(
      "Vencimento",
      "rentBillingTiming",
      v.rentBillingTiming,
      () =>
        set(
          "rentBillingTiming",
          String(v.rentBillingTiming) as RentalFormValues["rentBillingTiming"],
        ),
      label(LABEL_MAPS.rentBillingTiming, String(v.rentBillingTiming)),
    );
    add(
      "Tipo de caução",
      "cautionType",
      v.cautionType,
      () =>
        set(
          "cautionType",
          String(v.cautionType) as RentalFormValues["cautionType"],
        ),
      label(LABEL_MAPS.cautionType, String(v.cautionType)),
    );
    add(
      "Valor total da caução",
      "cautionType",
      v.cautionTotal,
      () => set("cautionTotal", Number(v.cautionTotal)),
      money(v.cautionTotal),
    );
    add(
      "Valor da parcela semanal",
      "cautionType",
      v.cautionInstallmentValue,
      () => set("cautionInstallmentValue", Number(v.cautionInstallmentValue)),
      money(v.cautionInstallmentValue),
    );
    add(
      "Dia da semana",
      "cautionType",
      v.cautionWeekday,
      () => set("cautionWeekday", String(v.cautionWeekday)),
      label(LABEL_MAPS.weekday, String(v.cautionWeekday)),
    );
    if (typeof v.notes === "string" && v.notes) {
      steps.push({
        label: "Observações",
        origin: origins.notes,
        value: v.notes,
        apply: () => set("notes", String(v.notes)),
      });
    }
    return steps;
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toRentalInput(values, isNew), {
      onSuccess: async (saved) => {
        if (aiFill.active) await aiFill.fulfill(saved.id);
        onSaved(saved);
      },
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, RENTAL_FORM_FIELDS)),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-8">
          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Cliente e veículo
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field }) => (
                    <RemoteCombobox
                      label="Cliente"
                      value={field.value}
                      selectedLabel={watch("customerLabel")}
                      options={customers.options}
                      isLoading={customers.isLoading}
                      search={customers.search}
                      onSearchChange={customers.setSearch}
                      onChange={(option) => {
                        field.onChange(option.value);
                        setValue("customerLabel", option.label);
                      }}
                      placeholder="Selecione o cliente"
                      searchPlaceholder="Buscar por nome ou CPF…"
                      error={errors.customerId?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="vehicleId"
                  render={({ field }) => (
                    <RemoteCombobox
                      label="Veículo"
                      value={field.value}
                      selectedLabel={watch("vehicleLabel")}
                      options={vehicles.options}
                      isLoading={vehicles.isLoading}
                      search={vehicles.search}
                      onSearchChange={vehicles.setSearch}
                      onChange={(option) => {
                        field.onChange(option.value);
                        setValue("vehicleLabel", option.label);
                      }}
                      placeholder="Selecione o veículo"
                      searchPlaceholder="Buscar por placa, marca ou modelo…"
                      error={errors.vehicleId?.message}
                    />
                  )}
                />
              </Col>
            </Row>
          </Box>

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Período e valores
            </Heading>
            <Row className="gap-y-4">
              <Col span={6} md={4}>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateField
                      label="Início"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startDate?.message}
                    />
                  )}
                />
              </Col>
              <Col span={6} md={4}>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateField
                      label="Fim (opcional)"
                      value={field.value}
                      onChange={field.onChange}
                      clearable
                      placeholder="Sem prazo"
                      error={errors.endDate?.message}
                    />
                  )}
                />
              </Col>
              <Col span={6} md={4}>
                <Controller
                  control={control}
                  name="rate"
                  render={({ field }) => (
                    <MoneyField
                      label="Valor"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.rate?.message}
                    />
                  )}
                />
              </Col>
              <Col span={6} md={4}>
                <Controller
                  control={control}
                  name="ratePeriod"
                  render={({ field }) => (
                    <SelectField
                      label="Periodicidade"
                      value={field.value}
                      options={options(LABEL_MAPS.ratePeriod)}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Col>
              <Col span={6} md={4}>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <SelectField
                      label="Forma de pagamento"
                      value={field.value}
                      options={options(LABEL_MAPS.paymentMethod)}
                      placeholder="Não definida"
                      onChange={field.onChange}
                    />
                  )}
                />
              </Col>
              <Col span={6} md={4}>
                {ratePeriod === "WEEKLY" ? (
                  <Controller
                    control={control}
                    name="paymentWeekday"
                    render={({ field }) => (
                      <SelectField
                        label="Dia de cobrança"
                        value={field.value}
                        options={weekdays}
                        placeholder="Não definido"
                        onChange={field.onChange}
                      />
                    )}
                  />
                ) : (
                  // Outside weekly there is no day to choose: the series is
                  // anchored on the first charge's date.
                  <Box className="space-y-2">
                    <Label>Dia de cobrança</Label>
                    <Text
                      size="xs"
                      tone="muted"
                      className="rounded-md border border-dashed px-3 py-2"
                    >
                      {ratePeriod === "DAILY"
                        ? "Cobrança diária — não há dia fixo."
                        : "Definido pela data da 1ª cobrança."}
                    </Text>
                  </Box>
                )}
              </Col>
              <Col md={4}>
                <Controller
                  control={control}
                  name="rentBillingTiming"
                  render={({ field }) => (
                    <SelectField
                      label="Cobrança do aluguel"
                      value={field.value}
                      options={options(LABEL_MAPS.rentBillingTiming)}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Col>
            </Row>
          </Box>

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Caução
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <Controller
                  control={control}
                  name="cautionType"
                  render={({ field }) => (
                    <SelectField
                      label="Tipo de caução"
                      value={field.value || "NONE"}
                      options={[
                        { value: "NONE", label: "Sem caução" },
                        ...options(LABEL_MAPS.cautionType),
                      ]}
                      onChange={(value) =>
                        field.onChange(value === "NONE" ? "" : value)
                      }
                    />
                  )}
                />
              </Col>
              {cautionType && (
                <Col md={6}>
                  <Controller
                    control={control}
                    name="cautionTotal"
                    render={({ field }) => (
                      <MoneyField
                        label="Valor total da caução"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.cautionTotal?.message}
                      />
                    )}
                  />
                </Col>
              )}
              {cautionType === "WEEKLY" && (
                <>
                  <Col md={6}>
                    <Controller
                      control={control}
                      name="cautionInstallmentValue"
                      render={({ field }) => (
                        <MoneyField
                          label="Valor da parcela semanal"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.cautionInstallmentValue?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      control={control}
                      name="cautionWeekday"
                      render={({ field }) => (
                        <SelectField
                          label="Dia da semana"
                          value={field.value}
                          options={weekdays}
                          onChange={field.onChange}
                          error={errors.cautionWeekday?.message}
                        />
                      )}
                    />
                  </Col>
                </>
              )}
            </Row>
            {cautionType === "INSTALLMENTS" && (
              <CautionInstallmentsEditor
                control={control}
                errors={errors}
                total={cautionTotal}
                rowsTotal={rowsTotal}
              />
            )}
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="rental-notes">Observações</Label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  id="rental-notes"
                  placeholder="Anotações internas sobre a locação"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          {isNew && (
            <Box className="space-y-4 rounded-lg border border-dashed p-4">
              <Row className="gap-y-4">
                <Col md={6}>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <SelectField
                        label="Status inicial"
                        value={field.value}
                        options={options(LABEL_MAPS.rentalStatus)}
                        onChange={field.onChange}
                        error={errors.status?.message}
                      />
                    )}
                  />
                </Col>
              </Row>
              <CheckboxField
                label="Cadastro retroativo (histórico)"
                hint="Locação feita antes do sistema — não gera contrato nem cobrança e não mexe na situação do veículo."
                checked={retroactive}
                onChange={(checked) => setValue("retroactive", checked)}
              />
            </Box>
          )}

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {isNew ? "Criar locação" : "Salvar alterações"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function RentalFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        {[2, 7, 2].map((fields, section) => (
          <Box key={section} className="space-y-4">
            <Skeleton shape="text" className="w-40 text-base" />
            <Row className="gap-y-4">
              {Array.from({ length: fields }, (_, index) => (
                <Col
                  key={index}
                  md={fields === 2 ? 6 : 4}
                  className="space-y-2"
                >
                  <Skeleton shape="text" className="w-24 text-sm" />
                  <Skeleton className="h-11 md:h-9" />
                </Col>
              ))}
            </Row>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
