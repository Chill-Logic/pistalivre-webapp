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
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CreatableCombobox } from "@/components/molecules/creatable-combobox";
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  MAINTENANCE_FORM_FIELDS,
  maintenanceFormDefaults,
  maintenanceFormSchema,
  toMaintenanceInput,
  type MaintenanceFormContext,
  type MaintenanceFormValues,
} from "./schema";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSaveMaintenance } from "@/hooks/api/gestao/maintenances/useMaintenanceMutations";
import { useMaintenanceProviders } from "@/hooks/api/gestao/maintenances/useMaintenanceProviders";
import { useLabels } from "@/hooks/ui/useLabels";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type { MaintenanceDetail } from "@/types/maintenance";

type MaintenanceFormProps = {
  /** Present = edit (replaces); absent = create. */
  maintenance?: MaintenanceDetail;
  /** Create from a vehicle or rental: the vehicle comes fixed. */
  context?: MaintenanceFormContext & { rentalCode?: string };
  cancelTo: string;
  onSaved: (maintenance: MaintenanceDetail) => void;
};

/**
 * Same fields as the management app: vehicle, type, day (retroactive ok),
 * km, cost, workshop, the services done (each with its own spec) and a
 * description. On create, attachments go right after saving.
 */
export function MaintenanceForm({
  maintenance,
  context,
  cancelTo,
  onSaved,
}: MaintenanceFormProps) {
  const isNew = !maintenance;
  const save = useSaveMaintenance(maintenance?.id);
  const { options } = useLabels();
  const vehicles = useVehicleOptions();
  const providers = useMaintenanceProviders();
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const vehicleFixed = !isNew || Boolean(context?.vehicleId);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: maintenanceFormDefaults(maintenance, context),
  });

  const services = watch("services");
  const serviceDetails = watch("serviceDetails");
  const vehicleLabel = watch("vehicleLabel");
  const rentalCode = maintenance?.rental?.code ?? context?.rentalCode;

  const toggleService = (code: string, checked: boolean) =>
    setValue(
      "services",
      checked ? [...services, code] : services.filter((c) => c !== code),
    );

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(
      { input: toMaintenanceInput(values, isNew), files: isNew ? files : [] },
      {
        onSuccess: ({ saved }) => onSaved(saved),
        onError: (error) =>
          setFormError(
            applyApiErrors(error, setError, MAINTENANCE_FORM_FIELDS),
          ),
      },
    );
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-8">
          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Manutenção
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                {vehicleFixed ? (
                  <Box className="space-y-1">
                    <Text size="sm" weight="medium">
                      Veículo
                    </Text>
                    <Text>{vehicleLabel}</Text>
                    {rentalCode && (
                      <Text size="xs" tone="muted">
                        Locação {rentalCode}
                      </Text>
                    )}
                    {errors.vehicleId && (
                      <Text size="xs" tone="destructive">
                        {errors.vehicleId.message}
                      </Text>
                    )}
                  </Box>
                ) : (
                  <Controller
                    control={control}
                    name="vehicleId"
                    render={({ field }) => (
                      <RemoteCombobox
                        label="Veículo"
                        value={field.value}
                        selectedLabel={vehicleLabel}
                        options={vehicles.options}
                        isLoading={vehicles.isLoading}
                        search={vehicles.search}
                        onSearchChange={vehicles.setSearch}
                        onChange={(option) => {
                          field.onChange(option.value);
                          setValue("vehicleLabel", option.label);
                        }}
                        placeholder="Selecione o veículo"
                        searchPlaceholder="Buscar por placa, marca ou modelo…"
                        error={errors.vehicleId?.message}
                      />
                    )}
                  />
                )}
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <SelectField
                      label="Tipo"
                      value={field.value}
                      onChange={field.onChange}
                      options={options(LABEL_MAPS.maintenanceType)}
                      error={errors.type?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  control={control}
                  name="performedAt"
                  render={({ field }) => (
                    <DateField
                      label="Data da manutenção"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.performedAt?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <FormField
                  label="Quilometragem (km)"
                  inputMode="numeric"
                  placeholder="Opcional"
                  {...register("mileage")}
                  error={errors.mileage?.message}
                />
              </Col>
              <Col md={4}>
                <Controller
                  control={control}
                  name="cost"
                  render={({ field }) => (
                    <MoneyField
                      label="Valor"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.cost?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="provider"
                  render={({ field }) => (
                    <CreatableCombobox
                      label="Oficina / prestador"
                      value={field.value}
                      onChange={field.onChange}
                      options={(providers.data ?? []).map((name) => ({
                        value: name,
                        label: name,
                      }))}
                      placeholder="Selecione ou digite"
                      searchPlaceholder="Buscar ou digitar a oficina…"
                      error={errors.provider?.message}
                    />
                  )}
                />
              </Col>
            </Row>
          </Box>

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Serviços realizados
            </Heading>
            <Row className="gap-y-4">
              {options(LABEL_MAPS.maintenanceService).map((service) => {
                const checked = services.includes(service.value);
                return (
                  <Col key={service.value} md={6} className="space-y-2">
                    <CheckboxField
                      label={service.label}
                      checked={checked}
                      onChange={(next) => toggleService(service.value, next)}
                    />
                    {checked && (
                      <FormField
                        label={`Especificação: ${service.label}`}
                        placeholder="Especifique (opcional)"
                        value={serviceDetails[service.value] ?? ""}
                        onChange={(event) =>
                          setValue("serviceDetails", {
                            ...serviceDetails,
                            [service.value]: event.target.value,
                          })
                        }
                      />
                    )}
                  </Col>
                );
              })}
            </Row>
          </Box>

          <Box className="space-y-4">
            <TextareaField
              label="Descrição"
              placeholder="Detalhes da manutenção (opcional)"
              {...register("description")}
              error={errors.description?.message}
            />
            {isNew && (
              <Box className="space-y-2">
                <Text size="sm" weight="medium">
                  Anexos
                </Text>
                <Text size="xs" tone="muted">
                  Recibo, nota fiscal, comprovante… Enviados ao salvar; o tipo
                  de cada um se ajusta depois, na página da manutenção.
                </Text>
                <FilePicker
                  files={files}
                  onChange={setFiles}
                  disabled={save.isPending}
                />
              </Box>
            )}
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
              {isNew ? "Registrar manutenção" : "Salvar alterações"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function MaintenanceFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        {[5, 6].map((fields, section) => (
          <Box key={section} className="space-y-4">
            <Skeleton shape="text" className="w-40 text-base" />
            <Row className="gap-y-4">
              {Array.from({ length: fields }, (_, index) => (
                <Col key={index} md={6} className="space-y-2">
                  <Skeleton shape="text" className="w-24 text-sm" />
                  <Skeleton className="h-11 md:h-9" />
                </Col>
              ))}
            </Row>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
