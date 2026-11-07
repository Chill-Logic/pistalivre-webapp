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
import { TextareaField } from "@/components/molecules/textarea-field";
import { PlanHighlightsField } from "@/components/organisms/plan-highlights-field";
import {
  PLAN_FORM_FIELDS,
  planFormDefaults,
  planFormSchema,
  toPlanInput,
  type PlanFormInput,
  type PlanFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSavePlan } from "@/hooks/api/gestao/plans/useSavePlan";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Plan } from "@/types/plan";

type PlanFormProps = {
  plan?: Plan;
  cancelTo: string;
  onSaved: (plan: Plan) => void;
};

export function PlanForm({ plan, cancelTo, onSaved }: PlanFormProps) {
  const save = useSavePlan(plan?.id);
  const { options } = useLabels();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlanFormInput, unknown, PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults(plan),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toPlanInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, PLAN_FORM_FIELDS)),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          {/* The price is what the public questionnaire shows, no deploy. */}
          <Alert variant="warning" role="note">
            O que você salvar aqui aparece na hora no questionário público,
            inclusive o preço.
          </Alert>

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
            <Col md={6} lg={3}>
              <Controller
                control={control}
                name="ratePeriod"
                render={({ field }) => (
                  <SelectField
                    label="Periodicidade"
                    value={field.value}
                    options={options(LABEL_MAPS.ratePeriod)}
                    onChange={field.onChange}
                    error={errors.ratePeriod?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={3}>
              <FormField
                label="Duração (meses)"
                inputMode="numeric"
                placeholder="Sem prazo fixo"
                error={errors.durationMonths?.message}
                {...register("durationMonths")}
              />
            </Col>
            <Col md={6} lg={3}>
              <FormField
                label="Ordem de exibição"
                inputMode="numeric"
                error={errors.sortOrder?.message}
                {...register("sortOrder")}
              />
            </Col>
            <Col>
              <TextareaField
                label="Descrição"
                rows={3}
                error={errors.description?.message}
                {...register("description")}
              />
            </Col>
            <Col>
              <PlanHighlightsField
                control={control}
                register={register}
                errors={errors}
              />
            </Col>
            {(
              [
                ["noFidelity", "Sem fidelidade", null],
                ["renewable", "Renovável", null],
                [
                  "ownershipAtEnd",
                  "Veículo fica com o cliente no fim",
                  null,
                ],
                [
                  "active",
                  "Ativo",
                  "Plano inativo não aparece no questionário.",
                ],
              ] as const
            ).map(([name, label, hint]) => (
              <Col key={name} md={6}>
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <CheckboxField
                      label={label}
                      hint={hint ?? undefined}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Col>
            ))}
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
              {plan ? "Salvar alterações" : "Cadastrar plano"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function PlanFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Skeleton className="h-12" />
        <Row className="gap-y-4">
          {([6, 3, 3, 3, 3] as const).map((lg, index) => (
            <Col key={index} md={6} lg={lg} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-24 text-sm" />
            <Skeleton className="h-20" />
          </Col>
          {[0, 1, 2, 3].map((index) => (
            <Col key={index} md={6}>
              <Skeleton shape="text" className="w-40 text-sm" />
            </Col>
          ))}
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-40 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
