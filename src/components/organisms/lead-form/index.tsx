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
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  LEAD_FORM_FIELDS,
  leadFormDefaults,
  leadFormSchema,
  toLeadInput,
  type LeadFormValues,
} from "./schema";
import { applyApiErrors } from "@/helpers/form";
import { useCreateLead } from "@/hooks/api/gestao/crm/useCreateLead";
import type { CrmOptions, LeadDetail } from "@/types/crm";
import { maskPhone } from "@/utils/masks";

type LeadFormProps = {
  options: CrmOptions;
  cancelTo: string;
  onSaved: (lead: LeadDetail) => void;
};

/**
 * A lead the staff found (OUTBOUND): the origin picked here becomes its
 * attribution, as if it had come in through a campaign link.
 */
export function LeadForm({ options, cancelTo, onSaved }: LeadFormProps) {
  const create = useCreateLead();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaults,
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    create.mutate(toLeadInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, LEAD_FORM_FIELDS)),
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
                autoComplete="off"
                error={errors.name?.message}
                {...register("name")}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <MaskedField
                    label="Telefone"
                    inputMode="tel"
                    placeholder="(11) 91234-5678"
                    value={field.value}
                    onChange={field.onChange}
                    mask={maskPhone}
                    error={errors.phone?.message}
                  />
                )}
              />
            </Col>
            <Col md={6}>
              <FormField
                label="E-mail (opcional)"
                type="email"
                inputMode="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </Col>
            <Col md={6}>
              <Controller
                control={control}
                name="origin"
                render={({ field }) => (
                  <SelectField
                    label="Origem"
                    value={field.value}
                    options={options.origins.map((origin) => ({
                      value: origin.key,
                      label: origin.label,
                    }))}
                    onChange={field.onChange}
                    placeholder="Onde você encontrou o lead?"
                    error={errors.origin?.message}
                  />
                )}
              />
            </Col>
            <Col>
              <FormField
                label="Veículo desejado (opcional)"
                placeholder="Ex.: Honda CG 160"
                error={errors.desiredVehicle?.message}
                {...register("desiredVehicle")}
              />
            </Col>
            <Col>
              <TextareaField
                label="Primeira anotação (opcional)"
                placeholder="O que já foi conversado"
                error={errors.note?.message}
                {...register("note")}
              />
            </Col>
          </Row>

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Cadastrar lead
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function LeadFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Row className="gap-y-4">
          {([6, 6, 6, 6, 12] as const).map((md, index) => (
            <Col key={index} md={md} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-32 text-sm" />
            <Skeleton className="h-24" />
          </Col>
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
