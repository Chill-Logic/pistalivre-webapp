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
import { Text } from "@/components/atoms/text";
import { CreatableCombobox } from "@/components/molecules/creatable-combobox";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { VehiclePartyField } from "@/components/organisms/vehicle-party-field";
import {
  toVehicleInput,
  VEHICLE_FORM_FIELDS,
  vehicleFormDefaults,
  vehicleFormSchema,
  type VehicleFormInput,
  type VehicleFormValues,
  type VehiclePartiesPrefill,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import {
  brandOptions,
  categoryOptions,
  modelOptions,
  typeSlugOfCategory,
  yearOptions,
} from "@/helpers/vehicle-form";
import { useSaveVehicle } from "@/hooks/api/gestao/vehicles/useSaveVehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  VehicleDetail,
  VehicleFormOptions,
  VehicleWrite,
} from "@/types/vehicle";

const CONFLICT_FIELDS = {
  placa: "plate",
  chassi: "chassis",
  renavam: "renavam",
} as const;

type VehicleFormProps = {
  options: VehicleFormOptions;
  /** Present = edit; absent = create. */
  vehicle?: VehicleDetail;
  cancelTo: string;
  onSaved: (vehicle: VehicleWrite) => void;
  /** New vehicle: title holder and owner already known (from a contract). */
  prefill?: VehiclePartiesPrefill;
};

export function VehicleForm({
  options,
  vehicle,
  cancelTo,
  onSaved,
  prefill,
}: VehicleFormProps) {
  const save = useSaveVehicle(vehicle?.id);
  const { options: labelOptions } = useLabels();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: vehicleFormDefaults(
      vehicle,
      vehicle ? typeSlugOfCategory(options, vehicle.category.id) : "",
      prefill,
    ),
  });

  const typeSlug = watch("typeSlug");
  const brand = watch("brand");

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toVehicleInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(
          applyApiErrors(error, setError, VEHICLE_FORM_FIELDS, {
            conflictFields: CONFLICT_FIELDS,
          }),
        ),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Row className="gap-y-4">
            <Col md={6} lg={4}>
              <FormField
                label="Placa"
                placeholder="ABC1D23"
                autoCapitalize="characters"
                className="uppercase"
                error={errors.plate?.message}
                {...register("plate")}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="typeSlug"
                render={({ field }) => (
                  <SelectField
                    label="Tipo"
                    value={field.value}
                    options={options.types.map((type) => ({
                      value: type.slug,
                      label: type.name,
                    }))}
                    onChange={(next) => {
                      field.onChange(next);
                      // A category of another type would be invalid.
                      setValue("categoryId", "");
                    }}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SelectField
                    label="Categoria"
                    value={field.value}
                    options={categoryOptions(options, typeSlug)}
                    onChange={field.onChange}
                    placeholder={
                      typeSlug ? "Selecione" : "Escolha o tipo antes"
                    }
                    disabled={!typeSlug}
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <CreatableCombobox
                    label="Marca"
                    value={field.value}
                    options={brandOptions(options)}
                    onChange={(next) => {
                      field.onChange(next);
                      // Models are per brand.
                      if (next !== brand) setValue("model", "");
                    }}
                    error={errors.brand?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="model"
                render={({ field }) => (
                  <CreatableCombobox
                    label="Modelo"
                    value={field.value}
                    options={modelOptions(options, brand)}
                    onChange={field.onChange}
                    placeholder={brand ? "Selecione" : "Escolha a marca antes"}
                    disabled={!brand}
                    error={errors.model?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <CreatableCombobox
                    label="Ano"
                    value={field.value}
                    options={yearOptions(options)}
                    onChange={field.onChange}
                    searchPlaceholder="Buscar ou digitar ano…"
                    numeric
                    error={errors.year?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Cor"
                placeholder="Prata"
                error={errors.color?.message}
                {...register("color")}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Chassi (17 caracteres)"
                placeholder="9BWZZZ377VT004251"
                maxLength={17}
                autoCapitalize="characters"
                className="uppercase"
                error={errors.chassis?.message}
                {...register("chassis")}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Renavam"
                placeholder="12345678901"
                inputMode="numeric"
                maxLength={11}
                error={errors.renavam?.message}
                {...register("renavam")}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="rate"
                render={({ field }) => (
                  <MoneyField
                    label="Valor da tarifa"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.rate?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="ratePeriod"
                render={({ field }) => (
                  <SelectField
                    label="Período da tarifa"
                    value={field.value}
                    options={labelOptions(LABEL_MAPS.ratePeriod)}
                    onChange={field.onChange}
                    error={errors.ratePeriod?.message}
                  />
                )}
              />
            </Col>
          </Row>

          <Box className="space-y-4 border-t pt-6">
            <Box className="space-y-1">
              <Text weight="semibold">Titularidade</Text>
              <Text size="xs" tone="muted">
                Investidor: titular a empresa, proprietário o investidor.
                Administração: o parceiro nos dois.
              </Text>
            </Box>
            <Row className="gap-y-4">
              <Col md={6}>
                <Controller
                  control={control}
                  name="titleHolderPartnerId"
                  render={({ field }) => (
                    <VehiclePartyField
                      label="Titular (nome no documento)"
                      value={field.value}
                      onChange={field.onChange}
                      known={vehicle?.titleHolder}
                      error={errors.titleHolderPartnerId?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="ownerPartnerId"
                  render={({ field }) => (
                    <VehiclePartyField
                      label="Proprietário"
                      value={field.value}
                      onChange={field.onChange}
                      known={vehicle?.owner}
                      error={errors.ownerPartnerId?.message}
                    />
                  )}
                />
              </Col>
            </Row>
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
              {vehicle ? "Salvar alterações" : "Cadastrar veículo"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

const FORM_FIELDS = 11;

export function VehicleFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Row className="gap-y-4">
          {Array.from({ length: FORM_FIELDS }, (_, index) => (
            <Col key={index} md={6} lg={4} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Skeleton className="h-11 sm:w-24 md:h-9" />
          <Skeleton className="h-11 sm:w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
