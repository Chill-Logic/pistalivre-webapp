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
import {
  SUPPLIER_FORM_FIELDS,
  supplierFormDefaults,
  supplierFormSchema,
  toSupplierInput,
  type SupplierFormInput,
  type SupplierFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSaveSupplier } from "@/hooks/api/gestao/suppliers/useSaveSupplier";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SupplierDetail } from "@/types/supplier";

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
  // The API refuses links on a COMPANY supplier; leaving VEHICLE keeps them,
  // but they stop showing (and counting) until it is switched back.
  const dropsLinks =
    supplier?.scope === "VEHICLE" &&
    !isVehicle &&
    supplier.vehicles.length > 0;

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
                    label={isVehicle ? "Valor base / mês" : "Valor / mês"}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.monthlyAmount?.message}
                  />
                )}
              />
            </Col>
            <Col>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <CheckboxField
                    label="Ativo"
                    hint="Fornecedor inativo não entra na projeção."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
          </Row>

          {isVehicle && (
            <Alert variant="info" role="note">
              No escopo Veículo, este é o valor sugerido ao vincular um veículo.
              O que conta na projeção é o valor de cada veículo vinculado.
            </Alert>
          )}
          {dropsLinks && (
            <Alert variant="warning" role="note">
              Este fornecedor tem veículos vinculados. No escopo Empresa eles
              deixam de aparecer e de contar até ele voltar a ser de Veículo.
            </Alert>
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
              {supplier ? "Salvar alterações" : "Cadastrar fornecedor"}
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
          {([6, 3, 3] as const).map((lg, index) => (
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
