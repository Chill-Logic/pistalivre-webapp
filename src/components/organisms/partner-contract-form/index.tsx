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
import type { PartnerContract } from "@/types/partner";

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

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toContractInput(values, contract), {
      onSuccess: (saved) => {
        if (contract) toast.success("Contrato atualizado");
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
            {PARTNER_COST_KEYS.map((key) => (
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
