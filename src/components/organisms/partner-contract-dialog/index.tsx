import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
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
  NO_DAY,
  toContractInput,
  type ContractFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { PARTNER_COST_KEYS, PARTNER_COST_PAYERS } from "@/constants/partner";
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

type PartnerContractDialogProps = {
  partnerId: string;
  /** Editing this contract's terms (none = a new draft). */
  contract?: PartnerContract;
  trigger: ReactNode;
  onCreated?: (contract: PartnerContract) => void;
};

/**
 * The contract's terms. Investment: the contribution (vehicles or money) and the
 * partner's share; management: the company's fee. The payout is always made
 * outside the system.
 */
export function PartnerContractDialog({
  partnerId,
  contract,
  trigger,
  onCreated,
}: PartnerContractDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle>
          {contract ? `Editar ${contract.code}` : "Novo contrato"}
        </DialogTitle>
        <DialogDescription>
          {contract
            ? "Os termos do contrato. A situação muda no card Situação."
            : "Nasce como rascunho: depois inclua os veículos e ative."}
        </DialogDescription>
        {open && (
          <ContractForm
            partnerId={partnerId}
            contract={contract}
            onDone={(saved) => {
              setOpen(false);
              if (!contract) onCreated?.(saved);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type ContractFormProps = {
  partnerId: string;
  contract?: PartnerContract;
  onDone: (contract: PartnerContract) => void;
};

function ContractForm({ partnerId, contract, onDone }: ContractFormProps) {
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
    watch,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: contractFormDefaults(contract),
  });
  const isInvestment = watch("type") === "INVESTMENT";
  const isCash = watch("contributionType") === "CASH";
  const isMonthly = watch("payoutFrequency") === "MONTHLY";

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
                onChange={field.onChange}
                error={errors.type?.message}
              />
            )}
          />
        </Col>
        {isInvestment ? (
          <>
            <Col sm={6}>
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
            <Col sm={6}>
              <Controller
                control={control}
                name="shareBase"
                render={({ field }) => (
                  <SegmentedField
                    label="Parte do parceiro sobre o"
                    value={field.value}
                    options={options(LABEL_MAPS.partnerShareBase)}
                    onChange={field.onChange}
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
                    }))}
                    onChange={field.onChange}
                    error={errors.costs?.[key]?.message}
                  />
                )}
              />
            ))}
          </Box>
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
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={save.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Spinner className="text-primary-foreground" />}
          {contract ? "Salvar contrato" : "Criar rascunho"}
        </Button>
      </DialogFooter>
    </Form>
  );
}
