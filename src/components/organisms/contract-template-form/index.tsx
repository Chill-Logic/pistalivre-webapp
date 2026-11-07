import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { TemplateHtmlEditor } from "@/components/organisms/template-html-editor";
import { applyApiErrors } from "@/helpers/form";
import { useSaveContractTemplate } from "@/hooks/api/gestao/templates/useContractTemplateMutations";
import { useTemplateVariables } from "@/hooks/api/gestao/templates/useTemplateVariables";
import type { ContractTemplateDetail } from "@/types/template";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome do modelo").max(120),
  active: z.boolean(),
  bodyHtml: z.string().min(1, "Escreva o corpo do contrato"),
  fixed: z.string(),
  weekly: z.string(),
  installments: z.string(),
});

type Values = z.infer<typeof schema>;

const API_FIELDS = ["name", "bodyHtml"] as const;

const CLAUSES = [
  { field: "fixed", label: "Fixo (depósito único)" },
  { field: "weekly", label: "Parcelada semanal" },
  { field: "installments", label: "Parcelada (entrada + saldos)" },
] as const;

type ContractTemplateFormProps = {
  /** Present = edit (a new version); absent = create. */
  template?: ContractTemplateDetail;
  cancelTo: string;
  onSaved: (template: ContractTemplateDetail) => void;
};

/**
 * Name, active flag, the body (with the caução slot) and one caução clause
 * per kind, as in the management app. Each save is a new version; contracts
 * already issued keep their own snapshot.
 */
export function ContractTemplateForm({
  template,
  cancelTo,
  onSaved,
}: ContractTemplateFormProps) {
  const isNew = !template;
  const save = useSaveContractTemplate(template?.id);
  const catalog = useTemplateVariables();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template?.name ?? "",
      active: template?.active ?? true,
      bodyHtml: template?.bodyHtml ?? "",
      fixed: template?.caucaoClauses.FIXED ?? "",
      weekly: template?.caucaoClauses.WEEKLY ?? "",
      installments: template?.caucaoClauses.INSTALLMENTS ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(
      {
        name: values.name.trim(),
        active: values.active,
        bodyHtml: values.bodyHtml,
        caucaoClauses: {
          FIXED: values.fixed,
          WEEKLY: values.weekly,
          INSTALLMENTS: values.installments,
        },
      },
      {
        onSuccess: onSaved,
        onError: (error) =>
          setFormError(
            // A repeated name comes back as 409 with `fields.name`.
            applyApiErrors(error, setError, API_FIELDS),
          ),
      },
    );
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
                    label="Ativo (disponível para gerar contratos)"
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
                label="Corpo do contrato"
                hint="Insira a “Cláusula de caução” (em Inserir variável → Blocos) onde a cláusula do tipo de caução da locação deve entrar."
                value={field.value}
                onChange={field.onChange}
                catalog={catalog.data}
                withSlots
                error={errors.bodyHtml?.message}
              />
            )}
          />

          <Box className="space-y-6">
            <Heading level={2} variant="section">
              Cláusulas de caução (uma por tipo)
            </Heading>
            {CLAUSES.map((clause) => (
              <Controller
                key={clause.field}
                control={control}
                name={clause.field}
                render={({ field }) => (
                  <TemplateHtmlEditor
                    label={clause.label}
                    value={field.value}
                    onChange={field.onChange}
                    catalog={catalog.data}
                  />
                )}
              />
            ))}
          </Box>

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

export function ContractTemplateFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        <Skeleton className="h-11 md:h-9" />
        {[64, 32, 32].map((height, index) => (
          <Box key={index} className="space-y-2">
            <Skeleton shape="text" className="w-40 text-sm" />
            <Skeleton className="h-10 rounded-b-none" />
            <Skeleton
              className="rounded-t-none"
              style={{ height: height * 4 }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
