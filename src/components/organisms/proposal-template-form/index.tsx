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
import { ProposalClausesField } from "@/components/organisms/proposal-clauses-field";
import { TemplateHtmlEditor } from "@/components/organisms/template-html-editor";
import { applyApiErrors } from "@/helpers/form";
import { useSaveProposalTemplate } from "@/hooks/api/gestao/templates/useProposalTemplateMutations";
import { useProposalTemplateVariables } from "@/hooks/api/gestao/templates/useProposalTemplateVariables";
import type { ProposalTemplateDetail } from "@/types/template";
import {
  proposalTemplateDefaults,
  proposalTemplateSchema,
  toProposalTemplateInput,
  type ProposalTemplateValues,
} from "./schema";

const API_FIELDS = ["name", "bodyHtml"] as const;

type ProposalTemplateFormProps = {
  /** Present = edit (a new version); absent = create. */
  template?: ProposalTemplateDetail;
  cancelTo: string;
  onSaved: (template: ProposalTemplateDetail) => void;
};

/**
 * Name, active flag, the body (with the `{{{clauses}}}` slot) and the
 * optional clauses. Each save is a new version; proposals already issued
 * keep their own snapshot.
 */
export function ProposalTemplateForm({
  template,
  cancelTo,
  onSaved,
}: ProposalTemplateFormProps) {
  const isNew = !template;
  const save = useSaveProposalTemplate(template?.id);
  const catalog = useProposalTemplateVariables();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProposalTemplateValues>({
    resolver: zodResolver(proposalTemplateSchema),
    defaultValues: proposalTemplateDefaults(template),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toProposalTemplateInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(
          applyApiErrors(error, setError, API_FIELDS, {
            conflictFields: { nome: "name" },
          }),
        ),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-8">
          <Row className="items-end gap-y-4">
            <Col md={8}>
              <FormField
                label="Nome do modelo"
                {...register("name")}
                error={errors.name?.message}
              />
            </Col>
            <Col md={4}>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <CheckboxField
                    label="Ativo (disponível para emitir propostas)"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
          </Row>

          <Controller
            control={control}
            name="bodyHtml"
            render={({ field }) => (
              <TemplateHtmlEditor
                label="Corpo da proposta"
                hint="Insira as “Cláusulas opcionais” (em Inserir variável → Blocos) onde as cláusulas marcadas na emissão devem entrar."
                value={field.value}
                onChange={field.onChange}
                catalog={catalog.data}
                withSlots
                error={errors.bodyHtml?.message}
              />
            )}
          />

          <ProposalClausesField
            control={control}
            register={register}
            errors={errors}
            catalog={catalog.data}
          />

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {isNew ? "Criar modelo" : "Salvar nova versão"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ProposalTemplateFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        <Skeleton className="h-11 md:h-9" />
        <Box className="space-y-2">
          <Skeleton shape="text" className="w-40 text-sm" />
          <Skeleton className="h-10 rounded-b-none" />
          <Skeleton className="h-64 rounded-t-none" />
        </Box>
        <Box className="space-y-4">
          <Skeleton shape="text" className="w-64 text-sm" />
          {[0, 1].map((index) => (
            <Card key={index} className="space-y-4 p-4">
              <Skeleton className="h-11 md:h-9" />
              <Skeleton className="h-10 rounded-b-none" />
              <Skeleton className="-mt-4 h-32 rounded-t-none" />
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
