import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  CONTRACT_FORM_FIELDS,
  contractFormDefaults,
  contractFormSchema,
  costsWithoutPartner,
  defaultCostsFor,
  isProfitShare,
  NO_DAY,
  toContractInput,
  type ContractFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  PARTNER_COST_KEYS,
  PARTNER_COST_PAYERS,
  PARTNER_COST_RULE_HINT,
} from "@/constants/partner";
import { applyApiErrors } from "@/helpers/form";
import {
  useCreatePartnerContract,
  useUpdatePartnerContract,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import { useAiFormFill, type AiFillStep } from "@/hooks/ui/useAiFormFill";
import type { CalculatorFill } from "@/components/organisms/partner-contract-calculator";
import type { RatePeriod } from "@/types/rental";
import { formatCurrency } from "@/utils/format";
import { percentInputOf } from "@/utils/percent";
import { dayToBrDate } from "@/utils/date";
import type { PartnerContract } from "@/types/partner";

/** How a management contract pays the owner. */
const PAYOUT_MODE_OPTIONS = [
  { value: "SHARE", label: "Taxa da empresa" },
  { value: "FIXED", label: "Repasse fixo por moto" },
];

/** Fixed payout: how the month's real maintenance reaches the owner. */
const MAINTENANCE_MODE_OPTIONS = [
  { value: "COST_SHARE", label: "Parte do custo" },
  { value: "COST_PLUS_FEE", label: "Custo + taxa" },
];

const PAYOUT_DAYS = [
  { value: NO_DAY, label: "Não definido" },
  ...Array.from({ length: 31 }, (_, index) => ({
    value: String(index + 1),
    label: `Dia ${index + 1}`,
  })),
];

type PartnerContractFormProps = {
  partnerId: string;
  /** Editing this contract's terms (none = a new draft). */
  contract?: PartnerContract;
  onDone: (contract: PartnerContract) => void;
  onCancel: () => void;
  /** Every change of the terms (the calculator beside it follows them). */
  onTermsChange?: (values: ContractFormValues) => void;
  /** The assistant's scenario for the calculator ("Preencher na tela"). */
  onCalculatorFill?: (fill: CalculatorFill) => void;
};

/**
 * The contract's terms, as a page section. Investment: the contribution
 * (vehicles or money) and the partner's share; management: the company's
 * fee. The payout is always made outside the system.
 */
export function PartnerContractForm({
  partnerId,
  contract,
  onDone,
  onCancel,
  onTermsChange,
  onCalculatorFill,
}: PartnerContractFormProps) {
  const { options, label } = useLabels();
  const create = useCreatePartnerContract(partnerId);
  const update = useUpdatePartnerContract(contract?.id ?? "");
  const save = contract ? update : create;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: contractFormDefaults(contract),
  });
  const values = useWatch({ control }) as ContractFormValues;
  const onTermsChangeRef = useRef(onTermsChange);
  onTermsChangeRef.current = onTermsChange;
  useEffect(() => {
    onTermsChangeRef.current?.(values);
  }, [values]);
  const isInvestment = watch("type") === "INVESTMENT";
  const isCash = watch("contributionType") === "CASH";
  const isMonthly = watch("payoutFrequency") === "MONTHLY";
  const isFixed = watch("payoutMode") === "FIXED";
  const costPlusFee = watch("maintenanceMode") === "COST_PLUS_FEE";
  // Fixed payout: the company does and pays the maintenance (the owner's part
  // follows the rule above); taxes with the owner are paid by them directly.
  const fixedManagement = !isInvestment && isFixed;
  const shareBase = watch("shareBase");
  const profitShare = isProfitShare(watch("type"), shareBase);
  const costHint =
    isInvestment && (shareBase === "PROFIT" || shareBase === "REVENUE")
      ? PARTNER_COST_RULE_HINT[shareBase]
      : null;
  // Whether the person chose an expense (then the defaults stop following).
  const costsTouched = useRef(false);

  /**
   * The type or the base changed: on the profit nothing is the partner's
   * (it becomes the company's); a new contract nobody touched follows the
   * default of its type and base.
   */
  const syncCosts = (type: string, base: string) => {
    if (isProfitShare(type, base)) {
      setValue("costs", costsWithoutPartner(getValues("costs")));
    } else if (!contract && !costsTouched.current) {
      setValue("costs", defaultCostsFor(type, base));
    }
  };

  // "Preencher na tela" from the chat (Livrinho read the deal): field by field,
  // each with where it came from, and the calculator gets the scenario last.
  const aiFill = useAiFormFill("partnerContract", ({ values: v, origins }) => {
    const steps: AiFillStep[] = [];
    const set = (name: string, value: unknown) =>
      setValue(name as keyof ContractFormValues, value as never, {
        shouldDirty: true,
        shouldValidate: true,
      });
    const add = (
      fieldLabel: string,
      field: string,
      present: unknown,
      apply: () => void,
      value?: string,
    ) => {
      if (present === null || present === undefined || present === "") return;
      steps.push({ label: fieldLabel, origin: origins[field], apply, value });
    };
    const pct = (n: unknown) => percentInputOf(Number(n));
    const money = (n: unknown) => formatCurrency(Number(n));
    const pick = <T extends { value: string; label: string }>(
      list: T[],
      code: unknown,
    ) => list.find((o) => o.value === code)?.label ?? String(code);
    const investment = v.type === "INVESTMENT";

    add(
      "Tipo do contrato",
      "type",
      v.type,
      () => set("type", v.type),
      label(LABEL_MAPS.partnerContractType, String(v.type)),
    );
    if (investment) {
      add(
        "Aporte",
        "contributionType",
        v.contributionType,
        () => set("contributionType", v.contributionType),
        label(LABEL_MAPS.partnerContributionType, String(v.contributionType)),
      );
      add(
        "Parte do parceiro sobre o",
        "shareBase",
        v.shareBase,
        () => set("shareBase", v.shareBase),
        label(LABEL_MAPS.partnerShareBase, String(v.shareBase)),
      );
      add(
        "Valor do aporte",
        "contributionAmount",
        v.contributionAmount,
        () => set("contributionAmount", Number(v.contributionAmount)),
        money(v.contributionAmount),
      );
      add(
        "Percentual do parceiro (%)",
        "sharePercent",
        v.sharePercent,
        () => set("sharePercent", pct(v.sharePercent)),
        `${pct(v.sharePercent)}%`,
      );
    } else {
      add(
        "Forma de repasse",
        "payoutMode",
        v.payoutMode,
        () => set("payoutMode", v.payoutMode),
        pick(PAYOUT_MODE_OPTIONS, v.payoutMode),
      );
      if (v.payoutMode === "FIXED") {
        add(
          "Repasse por moto (mês)",
          "fixedPayout",
          v.fixedPayout,
          () => set("fixedPayout", Number(v.fixedPayout)),
          money(v.fixedPayout),
        );
        add(
          "Manutenção do mês",
          "maintenanceMode",
          v.maintenanceMode,
          () => set("maintenanceMode", v.maintenanceMode),
          pick(MAINTENANCE_MODE_OPTIONS, v.maintenanceMode),
        );
        add(
          v.maintenanceMode === "COST_PLUS_FEE"
            ? "Taxa sobre a manutenção (%)"
            : "Parte do proprietário na manutenção (%)",
          "maintenanceFeePercent",
          v.maintenanceFeePercent,
          () => set("maintenanceFeePercent", pct(v.maintenanceFeePercent)),
          `${pct(v.maintenanceFeePercent)}%`,
        );
      } else {
        add(
          "Taxa da empresa (%)",
          "adminFeePercent",
          v.adminFeePercent,
          () => set("adminFeePercent", pct(v.adminFeePercent)),
          `${pct(v.adminFeePercent)}%`,
        );
        add(
          "Taxa fixa por mês (opcional)",
          "adminFeeFixed",
          v.adminFeeFixed,
          () => set("adminFeeFixed", Number(v.adminFeeFixed)),
          money(v.adminFeeFixed),
        );
      }
    }
    add(
      "Início",
      "startDate",
      v.startDate,
      () => set("startDate", String(v.startDate)),
      dayToBrDate(String(v.startDate)),
    );
    add(
      "Fim (opcional)",
      "endDate",
      v.endDate,
      () => set("endDate", String(v.endDate)),
      dayToBrDate(String(v.endDate ?? "")),
    );
    add(
      "Recorrência",
      "payoutFrequency",
      v.payoutFrequency,
      () => set("payoutFrequency", v.payoutFrequency),
      label(LABEL_MAPS.partnerPayoutFrequency, String(v.payoutFrequency)),
    );
    add(
      "Dia do mês",
      "payoutDay",
      v.payoutDay,
      () => set("payoutDay", String(v.payoutDay)),
      `Dia ${v.payoutDay}`,
    );
    add(
      "Dia da semana",
      "payoutWeekday",
      v.payoutWeekday,
      () => set("payoutWeekday", String(v.payoutWeekday)),
      label(LABEL_MAPS.weekday, String(v.payoutWeekday)),
    );
    const costs = (v.costs ?? {}) as Partial<ContractFormValues["costs"]>;
    for (const key of PARTNER_COST_KEYS) {
      add(
        label(LABEL_MAPS.partnerCost, key),
        "costs",
        costs[key],
        () => {
          costsTouched.current = true;
          set(`costs.${key}`, costs[key]);
        },
        label(LABEL_MAPS.partnerCostPayer, String(costs[key])),
      );
    }
    add(
      "Observações (opcional)",
      "notes",
      v.notes,
      () => set("notes", String(v.notes)),
      "As cláusulas combinadas entram no texto do contrato depois.",
    );
    const calc = v.calculator as {
      count: number | null;
      rate: number | null;
      period: RatePeriod | null;
      occupancy: number | null;
      costs: CalculatorFill["costs"];
    } | null;
    if (calc && onCalculatorFill) {
      add(
        "Motos",
        "calculator",
        true,
        () => onCalculatorFill({ key: Date.now(), ...calc }),
        "O cenário da conversa vai para a calculadora ao lado.",
      );
    }
    return steps;
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toContractInput(values, contract), {
      onSuccess: async (saved) => {
        if (contract) toast.success("Contrato atualizado");
        // Saved through the screen: the chat's proposal is done (no confirming twice).
        if (aiFill.active) await aiFill.fulfill(saved.id);
        onDone(saved);
      },
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, CONTRACT_FORM_FIELDS)),
    });
  });

  return (
    <Form onSubmit={onSubmit} noValidate className="space-y-4">
      <Row className="gap-y-4">
        <Col>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SegmentedField
                label="Tipo do contrato"
                value={field.value}
                options={options(LABEL_MAPS.partnerContractType)}
                onChange={(next) => {
                  field.onChange(next);
                  syncCosts(next, getValues("shareBase"));
                }}
                error={errors.type?.message}
              />
            )}
          />
        </Col>
        {isInvestment ? (
          <>
            <Col>
              <Controller
                control={control}
                name="contributionType"
                render={({ field }) => (
                  <SegmentedField
                    label="Aporte"
                    value={field.value}
                    options={options(LABEL_MAPS.partnerContributionType)}
                    onChange={field.onChange}
                    error={errors.contributionType?.message}
                  />
                )}
              />
            </Col>
            <Col>
              <Controller
                control={control}
                name="shareBase"
                render={({ field }) => (
                  <SegmentedField
                    label="Parte do parceiro sobre o"
                    value={field.value}
                    options={options(LABEL_MAPS.partnerShareBase)}
                    onChange={(next) => {
                      field.onChange(next);
                      syncCosts(getValues("type"), next);
                    }}
                    error={errors.shareBase?.message}
                  />
                )}
              />
            </Col>
            {isCash && (
              <>
                <Col sm={6}>
                  <Controller
                    control={control}
                    name="contributionAmount"
                    render={({ field }) => (
                      <MoneyField
                        label="Valor do aporte"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.contributionAmount?.message}
                      />
                    )}
                  />
                </Col>
                <Col sm={6}>
                  <Controller
                    control={control}
                    name="contributionDate"
                    render={({ field }) => (
                      <DateField
                        label="Data do aporte (opcional)"
                        value={field.value}
                        onChange={field.onChange}
                        clearable
                        error={errors.contributionDate?.message}
                      />
                    )}
                  />
                </Col>
              </>
            )}
            <Col sm={6}>
              <FormField
                label="Percentual do parceiro (%)"
                inputMode="decimal"
                placeholder="Ex.: 40"
                error={errors.sharePercent?.message}
                {...register("sharePercent")}
              />
            </Col>
          </>
        ) : (
          <>
            <Col>
              <Controller
                control={control}
                name="payoutMode"
                render={({ field }) => (
                  <SegmentedField
                    label="Forma de repasse"
                    value={field.value}
                    options={PAYOUT_MODE_OPTIONS}
                    onChange={field.onChange}
                    error={errors.payoutMode?.message}
                  />
                )}
              />
            </Col>
            {isFixed ? (
              <>
                <Col sm={6}>
                  <Controller
                    control={control}
                    name="fixedPayout"
                    render={({ field }) => (
                      <MoneyField
                        label="Repasse por moto (mês)"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.fixedPayout?.message}
                      />
                    )}
                  />
                </Col>
                <Col sm={6}>
                  <FormField
                    label={
                      costPlusFee
                        ? "Taxa sobre a manutenção (%)"
                        : "Parte do proprietário na manutenção (%)"
                    }
                    inputMode="decimal"
                    placeholder="Ex.: 10"
                    error={errors.maintenanceFeePercent?.message}
                    {...register("maintenanceFeePercent")}
                  />
                </Col>
                <Col>
                  <Controller
                    control={control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <SegmentedField
                        label="Manutenção do mês"
                        value={field.value}
                        options={MAINTENANCE_MODE_OPTIONS}
                        onChange={field.onChange}
                        error={errors.maintenanceMode?.message}
                      />
                    )}
                  />
                </Col>
                <Col>
                  <Text size="xs" tone="muted">
                    O repasse por moto é o teto, proporcional aos dias em que
                    ela ficou alugada. A empresa faz e paga a manutenção; do
                    repasse sai{" "}
                    {costPlusFee
                      ? "o custo da oficina no mês mais a taxa acima"
                      : "a parte do proprietário no custo da oficina do mês (a empresa arca com o resto)"}
                    , além do seguro e das despesas marcadas como dele abaixo.
                    Se os descontos passarem do repasse, a diferença fica para o
                    próximo. O que o locatário paga acima disso fica com a
                    empresa.
                  </Text>
                </Col>
              </>
            ) : (
              <>
                <Col sm={6}>
                  <FormField
                    label="Taxa da empresa (%)"
                    inputMode="decimal"
                    placeholder="Ex.: 15"
                    error={errors.adminFeePercent?.message}
                    {...register("adminFeePercent")}
                  />
                </Col>
                <Col sm={6}>
                  <Controller
                    control={control}
                    name="adminFeeFixed"
                    render={({ field }) => (
                      <MoneyField
                        label="Taxa fixa por mês (opcional)"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.adminFeeFixed?.message}
                      />
                    )}
                  />
                </Col>
              </>
            )}
          </>
        )}
        <Col sm={6}>
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
        <Col sm={6}>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DateField
                label="Fim (opcional)"
                value={field.value}
                onChange={field.onChange}
                clearable
                placeholder="Sem data de fim"
                error={errors.endDate?.message}
              />
            )}
          />
        </Col>
        <Col className="space-y-4 border-t pt-4">
          <Heading level={3} variant="section">
            Repasse ao parceiro
          </Heading>
          <Row className="gap-y-4">
            <Col sm={7}>
              <Controller
                control={control}
                name="payoutFrequency"
                render={({ field }) => (
                  <SegmentedField
                    label="Recorrência"
                    value={field.value}
                    options={options(LABEL_MAPS.partnerPayoutFrequency)}
                    onChange={field.onChange}
                    error={errors.payoutFrequency?.message}
                  />
                )}
              />
            </Col>
            <Col sm={5}>
              {isMonthly ? (
                <Controller
                  key="payoutDay"
                  control={control}
                  name="payoutDay"
                  render={({ field }) => (
                    <SelectField
                      label="Dia do mês"
                      value={field.value}
                      options={PAYOUT_DAYS}
                      onChange={field.onChange}
                      error={errors.payoutDay?.message}
                    />
                  )}
                />
              ) : (
                <Controller
                  key="payoutWeekday"
                  control={control}
                  name="payoutWeekday"
                  render={({ field }) => (
                    <SelectField
                      label="Dia da semana"
                      value={field.value}
                      options={[
                        { value: NO_DAY, label: "Não definido" },
                        ...options(LABEL_MAPS.weekday),
                      ]}
                      onChange={field.onChange}
                      error={errors.payoutWeekday?.message}
                    />
                  )}
                />
              )}
            </Col>
          </Row>
        </Col>
        <Col className="space-y-4 border-t pt-4">
          <Heading level={3} variant="section">
            Quem paga cada despesa
          </Heading>
          <Box className="space-y-3">
            {fixedManagement && (
              <Text size="sm" tone="muted">
                Manutenção: a empresa faz e paga; o proprietário participa
                pela regra do repasse acima.
              </Text>
            )}
            {PARTNER_COST_KEYS.filter(
              (key) => !(fixedManagement && key === "maintenance"),
            ).map((key) => (
              <Controller
                key={key}
                control={control}
                name={`costs.${key}`}
                render={({ field }) => (
                  <SegmentedField
                    layout="inline"
                    label={label(LABEL_MAPS.partnerCost, key)}
                    value={field.value}
                    options={PARTNER_COST_PAYERS[key].map((payer) => ({
                      value: payer,
                      label: label(LABEL_MAPS.partnerCostPayer, payer),
                      disabled: profitShare && payer === "PARTNER",
                    }))}
                    onChange={(next) => {
                      costsTouched.current = true;
                      field.onChange(next);
                    }}
                    error={errors.costs?.[key]?.message}
                  />
                )}
              />
            ))}
          </Box>
          {costHint && (
            <Text size="xs" tone="muted">
              {costHint}
            </Text>
          )}
        </Col>
        <Col className="border-t pt-4">
          <TextareaField
            label="Observações (opcional)"
            rows={3}
            error={errors.notes?.message}
            {...register("notes")}
          />
        </Col>
      </Row>
      <Alert variant="info" role="note">
        O repasse é sempre feito por fora, no dia combinado: o sistema não paga
        nada ao parceiro.
      </Alert>
      {formError && <Alert>{formError}</Alert>}
      <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={save.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Spinner className="text-primary-foreground" />}
          {contract ? "Salvar contrato" : "Criar rascunho"}
        </Button>
      </Box>
    </Form>
  );
}

export function PartnerContractFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Box key={index} className="space-y-2">
            <Skeleton shape="text" className="w-32 text-sm" />
            <Skeleton className="h-11 md:h-9" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
