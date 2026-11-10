import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Controller,
  useForm,
  type FieldPath,
  type PathValue,
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
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextLink } from "@/components/molecules/text-link";
import { VehicleDocumentReader } from "@/components/organisms/vehicle-document-reader";
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
import { ROUTES } from "@/constants/routes";
import { applyApiErrors } from "@/helpers/form";
import {
  categoryOptions,
  DOCUMENT_REVIEW_HINTS,
  typeSlugOfCategory,
} from "@/helpers/vehicle-form";
import { useCatalog } from "@/hooks/api/gestao/catalog/useCatalog";
import { useSaveVehicle } from "@/hooks/api/gestao/vehicles/useSaveVehicle";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  VehicleDetail,
  VehicleDocumentResult,
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
    trigger,
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
  const model = watch("model");
  const year = watch("year");

  // The model comes from the catalogue: active items (+ the one this vehicle
  // already is, even if inactivated since).
  const catalog = useCatalog();
  const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const catalogItems = (catalog.data?.items ?? []).filter(
    (item) =>
      item.active ||
      (vehicle && item.modelId === vehicle.model.id && item.year === vehicle.year),
  );
  const catalogChoice =
    catalogItems.find(
      (item) =>
        sameText(item.brandName, brand) &&
        sameText(item.modelName, model) &&
        String(item.year) === year,
    )?.id ?? "";
  const catalogOptions = catalogItems.map((item) => ({
    value: item.id,
    label: `${item.brandName} ${item.modelName} ${item.year}`,
  }));

  // The CRLV read by the AI: fills what was read (never blanks a typed field)
  // and points at what to compare with the paper.
  const fillFromDocument = ({ fields, review, titleHolder }: VehicleDocumentResult) => {
    const filled: FieldPath<VehicleFormInput>[] = [];
    const fill = <K extends FieldPath<VehicleFormInput>>(
      name: K,
      value: PathValue<VehicleFormInput, K>,
    ) => {
      setValue(name, value, { shouldDirty: true });
      filled.push(name);
    };
    if (fields.plate) fill("plate", fields.plate);
    if (fields.renavam) fill("renavam", fields.renavam);
    if (fields.chassis) fill("chassis", fields.chassis);
    if (fields.color) fill("color", fields.color);
    if (fields.catalogItemId) {
      fill("brand", fields.brand);
      fill("model", fields.model);
      fill("year", String(fields.year));
    }
    if (titleHolder?.kind === "company") fill("titleHolderPartnerId", null);
    if (titleHolder?.kind === "partner") {
      fill("titleHolderPartnerId", titleHolder.partnerId);
    }
    // Validate first, then flag: a validation after would clear the hints.
    void trigger(filled).then(() => {
      for (const field of ["plate", "renavam", "chassis"] as const) {
        if (review.includes(field) && fields[field]) {
          setError(field, { message: DOCUMENT_REVIEW_HINTS[field] });
        }
      }
    });
  };

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
          {!vehicle && options.readDocument && (
            <VehicleDocumentReader
              onRead={fillFromDocument}
              disabled={save.isPending}
            />
          )}
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
            <Col md={6} lg={8}>
              <Box className="space-y-1">
                <SelectField
                  label="Modelo (do catálogo)"
                  value={catalogChoice}
                  options={catalogOptions}
                  onChange={(id) => {
                    const item = catalog.data?.items.find((entry) => entry.id === id);
                    if (!item) return;
                    setValue("brand", item.brandName, { shouldValidate: true });
                    setValue("model", item.modelName, { shouldValidate: true });
                    setValue("year", String(item.year), { shouldValidate: true });
                  }}
                  placeholder={catalog.isPending ? "Carregando o catálogo…" : "Escolha o modelo e ano"}
                  disabled={catalog.isPending}
                  error={errors.brand?.message ?? errors.model?.message ?? errors.year?.message}
                />
                <Text size="xs" tone="muted">
                  Não está na lista?{" "}
                  <TextLink to={ROUTES.vehicleCatalog}>Cadastre no catálogo</TextLink>{" "}
                  primeiro.
                </Text>
              </Box>
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
