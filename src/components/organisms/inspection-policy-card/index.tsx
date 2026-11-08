import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { applyApiErrors } from "@/helpers/form";
import { useUpdateInspectionPolicy } from "@/hooks/api/gestao/templates/useInspectionTemplateMutations";
import type { InspectionPolicy } from "@/types/template";

const wholeNumber = (max: number, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      const n = Number(value);
      return value !== "" && Number.isInteger(n) && n >= 1 && n <= max;
    }, message);

/** Mirrors the API (whole numbers, 1 or more). */
const schema = z.object({
  fullEveryDays: wholeNumber(365, "Informe de 1 a 365 dias"),
  kmEveryDays: wholeNumber(365, "Informe de 1 a 365 dias"),
  kmEveryKm: wholeNumber(1_000_000, "Informe de 1 a 1.000.000 km"),
  kmOnMaintenance: z.boolean(),
});

type Values = z.infer<typeof schema>;

const API_FIELDS = ["fullEveryDays", "kmEveryDays", "kmEveryKm"] as const;

const NUMBER_FIELDS = [
  { name: "fullEveryDays", label: "Vistoria completa a cada (dias)" },
  { name: "kmEveryDays", label: "Leitura de km a cada (dias)" },
  { name: "kmEveryKm", label: "Leitura de km a cada (km)" },
] as const;

/** How often inspections are due (the cadence policy), editable. */
export function InspectionPolicyCard({ policy }: { policy: InspectionPolicy }) {
  const update = useUpdateInspectionPolicy();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullEveryDays: String(policy.fullEveryDays ?? ""),
      kmEveryDays: String(policy.kmEveryDays ?? ""),
      kmEveryKm: String(policy.kmEveryKm ?? ""),
      kmOnMaintenance: policy.kmOnMaintenance,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    update.mutate(
      {
        fullEveryDays: Number(values.fullEveryDays),
        kmEveryDays: Number(values.kmEveryDays),
        kmEveryKm: Number(values.kmEveryKm),
        kmOnMaintenance: values.kmOnMaintenance,
      },
      {
        onSuccess: (saved) =>
          reset({
            fullEveryDays: String(saved.fullEveryDays ?? ""),
            kmEveryDays: String(saved.kmEveryDays ?? ""),
            kmEveryKm: String(saved.kmEveryKm ?? ""),
            kmOnMaintenance: saved.kmOnMaintenance,
          }),
        onError: (error) =>
          setFormError(applyApiErrors(error, setError, API_FIELDS)),
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cadência</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            {NUMBER_FIELDS.map((field) => (
              <Col key={field.name} md={4}>
                <FormField
                  label={field.label}
                  inputMode="numeric"
                  {...register(field.name)}
                  error={errors[field.name]?.message}
                />
              </Col>
            ))}
          </Row>
          <Controller
            control={control}
            name="kmOnMaintenance"
            render={({ field }) => (
              <CheckboxField
                label="Pedir leitura de km a cada manutenção"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {formError && <Alert>{formError}</Alert>}
          <Box className="flex justify-end">
            <Button
              type="submit"
              disabled={update.isPending || !isDirty}
              className="w-full sm:w-auto"
            >
              {update.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar cadência
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function InspectionPolicyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Row className="gap-y-4">
          {[0, 1, 2].map((index) => (
            <Col key={index} md={4} className="space-y-2">
              <Skeleton shape="text" className="w-48 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Skeleton shape="text" className="w-64 text-sm" />
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-full sm:w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
