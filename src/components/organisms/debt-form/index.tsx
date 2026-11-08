import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSaveDebt } from "@/hooks/api/gestao/debts/useDebtMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import {
  useCustomerOptions,
  useSupplierOptions,
  useUserOptions,
  useVehicleOptions,
} from "@/hooks/ui/useRemoteOptions";
import type { DebtDetail } from "@/types/debt";
import {
  DEBT_FORM_FIELDS,
  debtFormDefaults,
  debtFormSchema,
  emptyLender,
  toDebtInput,
  type DebtFormValues,
} from "./schema";

type DebtFormProps = {
  debt?: DebtDetail;
  cancelTo: string;
  onSaved: (debt: DebtDetail) => void;
};

/**
 * What the company owes: who lent (one or more, from our records or by
 * name), how much, interest and installments. The balance and the plan are
 * worked out by the server after saving (the form computes no money).
 */
export function DebtForm({ debt, cancelTo, onSaved }: DebtFormProps) {
  const { label } = useLabels();
  const save = useSaveDebt(debt?.id);
  const vehicles = useVehicleOptions();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: debtFormDefaults(debt),
  });
  const lenders = useFieldArray({ control, name: "lenders" });
  const interestPercent = watch("interestPercent");
  const interestPeriod = watch("interestPeriod");
  const installments = Number(watch("installments")) || 1;
  const hasInterest = Number(interestPercent.replace(",", ".")) > 0;

  const options = (map: LabelMapName, keys: string[]) =>
    keys.map((key) => ({ value: key, label: label(map, key) }));

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toDebtInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, DEBT_FORM_FIELDS)),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Box className="space-y-3">
            <Text weight="medium">Quem emprestou</Text>
            {lenders.fields.map((field, index) => (
              <LenderRow
                key={field.id}
                index={index}
                control={control}
                canRemove={lenders.fields.length > 1}
                onRemove={() => lenders.remove(index)}
                typeOptions={options(LABEL_MAPS.debtLenderType, [
                  "OTHER",
                  "CUSTOMER",
                  "SUPPLIER",
                  "USER",
                ])}
                error={
                  errors.lenders?.[index]?.name?.message ??
                  errors.lenders?.[index]?.refId?.message
                }
              />
            ))}
            {errors.lenders?.message && (
              <Text tone="destructive">{errors.lenders.message}</Text>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => lenders.append(emptyLender())}
            >
              <Plus />
              Adicionar credor
            </Button>
          </Box>

          <Row className="gap-y-4">
            <Col md={6}>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <SelectField
                    label="Tipo de dívida"
                    value={field.value}
                    options={options(LABEL_MAPS.debtKind, [
                      "LOAN",
                      "FINANCING",
                      "OTHER",
                    ])}
                    onChange={field.onChange}
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
                    label="Veículo (opcional)"
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
                    placeholder="Da empresa (nenhum veículo)"
                    searchPlaceholder="Buscar por placa ou modelo"
                    error={errors.vehicleId?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name="principal"
                render={({ field }) => (
                  <MoneyField
                    label="Quanto pegamos"
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? 0)}
                    error={errors.principal?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <FormField
                label="Juros (%) — opcional"
                inputMode="decimal"
                placeholder="Ex.: 10"
                error={errors.interestPercent?.message}
                {...register("interestPercent")}
              />
            </Col>
            {hasInterest && (
              <Col md={interestPeriod === "TOTAL" ? 12 : 4}>
                <Controller
                  control={control}
                  name="interestPeriod"
                  render={({ field }) => (
                    <SelectField
                      label="Os juros são"
                      value={field.value}
                      options={options(LABEL_MAPS.debtInterestPeriod, [
                        "MONTHLY",
                        "YEARLY",
                        "TOTAL",
                      ])}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Col>
            )}
            {hasInterest && interestPeriod !== "TOTAL" && (
              <>
                <Col md={4}>
                  <Controller
                    control={control}
                    name="interestMode"
                    render={({ field }) => (
                      <SelectField
                        label="Cálculo"
                        value={field.value}
                        options={options(LABEL_MAPS.debtInterestMode, [
                          "SIMPLE",
                          "COMPOUND",
                        ])}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Col>
                <Col md={4}>
                  <Controller
                    control={control}
                    name="interestBase"
                    render={({ field }) => (
                      <SelectField
                        label="Incidem sobre"
                        value={field.value}
                        options={options(LABEL_MAPS.debtInterestBase, [
                          "PRINCIPAL",
                          "OUTSTANDING",
                        ])}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Col>
              </>
            )}
            <Col md={6}>
              <Controller
                control={control}
                name="borrowedAt"
                render={({ field }) => (
                  <DateField
                    label="Quando pegamos"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.borrowedAt?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DateField
                    label={
                      installments > 1
                        ? "1ª parcela em"
                        : "Combinado para pagar (opcional)"
                    }
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dueDate?.message}
                    clearable={installments <= 1}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <FormField
                label="Parcelas"
                inputMode="numeric"
                error={errors.installments?.message}
                {...register("installments")}
              />
            </Col>
            <Col md={6} className="flex items-end">
              <Text size="xs" tone="muted">
                {installments > 1
                  ? "A 1ª cai no dia combinado e as demais de mês em mês."
                  : "1 = à vista."}
              </Text>
            </Col>
            <Col>
              <Controller
                control={control}
                name="countsAsCost"
                render={({ field }) => (
                  <CheckboxField
                    label="Entra no custo mensal da operação"
                    hint="É o que decide se a dívida pesa na projeção (nem todo débito de veículo é custo recorrente)."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
            <Col>
              <TextareaField
                label="Observação (opcional)"
                placeholder="Ex.: para a entrada da moto 3; combinado por WhatsApp"
                error={errors.notes?.message}
                {...register("notes")}
              />
            </Col>
          </Row>

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {debt ? "Salvar dívida" : "Cadastrar dívida"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

type LenderRowProps = {
  index: number;
  control: Control<DebtFormValues>;
  canRemove: boolean;
  onRemove: () => void;
  typeOptions: { value: string; label: string }[];
  error?: string;
};

/** One lender: its kind, then a picker (our records) or a free name. */
function LenderRow({
  index,
  control,
  canRemove,
  onRemove,
  typeOptions,
  error,
}: LenderRowProps) {
  const customers = useCustomerOptions();
  const suppliers = useSupplierOptions();
  const users = useUserOptions();

  return (
    <Controller
      control={control}
      name={`lenders.${index}`}
      render={({ field }) => {
        const lender = field.value;
        const set = (next: Partial<typeof lender>) =>
          field.onChange({ ...lender, ...next });
        const picker =
          lender.type === "CUSTOMER"
            ? { label: "Cliente", source: customers }
            : lender.type === "SUPPLIER"
              ? { label: "Fornecedor", source: suppliers }
              : lender.type === "USER"
                ? { label: "Quem da equipe", source: users }
                : null;
        return (
          <Row className="items-end gap-y-3 rounded-md border p-3">
            <Col md={4}>
              <SelectField
                label="Tipo"
                value={lender.type}
                options={typeOptions}
                onChange={(type) =>
                  set({
                    type: type as typeof lender.type,
                    refId: "",
                    refLabel: "",
                    name: "",
                  })
                }
              />
            </Col>
            <Col md={canRemove ? 7 : 8}>
              {picker ? (
                <RemoteCombobox
                  label={picker.label}
                  value={lender.refId}
                  selectedLabel={lender.refLabel}
                  options={picker.source.options}
                  isLoading={picker.source.isLoading}
                  search={picker.source.search}
                  onSearchChange={picker.source.setSearch}
                  onChange={(option) =>
                    set({ refId: option.value, refLabel: option.label })
                  }
                  placeholder="Selecione"
                  error={error}
                />
              ) : (
                <FormField
                  label="Nome de quem emprestou"
                  placeholder="Ex.: Banco X, tio do sócio, investidor"
                  value={lender.name}
                  onChange={(event) => set({ name: event.target.value })}
                  error={error}
                />
              )}
            </Col>
            {canRemove && (
              <Col md={1} className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Remover credor ${index + 1}`}
                  onClick={onRemove}
                >
                  <Trash2 />
                </Button>
              </Col>
            )}
          </Row>
        );
      }}
    />
  );
}

export function DebtFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Skeleton className="h-24" />
        <Row className="gap-y-4">
          {([6, 6, 6, 6, 6, 6, 6, 6] as const).map((md, index) => (
            <Col key={index} md={md} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
