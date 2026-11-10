import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { CreatableCombobox } from "@/components/molecules/creatable-combobox";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { applyApiErrors } from "@/helpers/form";
import { useStartQuestionnaire } from "@/hooks/api/cliente/public-lead/useStartQuestionnaire";
import { useAttribution } from "@/hooks/ui/useAttribution";
import { maskPhone, onlyDigits } from "@/utils/masks";

const schema = z.object({
  name: z.string().trim().min(1, "Diga seu nome").max(120),
  phone: z
    .string()
    .refine(
      (value) => [10, 11].includes(onlyDigits(value).length),
      "Telefone inválido",
    ),
  email: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "E-mail inválido",
    ),
  vehicle: z.string().trim().max(120),
  /** Honeypot: hidden from people, bots fill it. */
  website: z.string(),
});

type Values = z.infer<typeof schema>;

type LeadStartFormProps = {
  models: { id: string; label: string }[];
  /** "Quero alugar" on the landing, "Começar" on the questionnaire. */
  submitLabel: string;
  phoneLabel: string;
  /** The session's token (null = the honeypot caught a bot). */
  onStarted: (token: string | null) => void;
};

/**
 * Who is arriving: name, WhatsApp and the vehicle wanted (one we have, or a
 * suggestion: the map of demand). Sends the campaign attribution along.
 */
export function LeadStartForm({
  models,
  submitLabel,
  phoneLabel,
  onStarted,
}: LeadStartFormProps) {
  const start = useStartQuestionnaire();
  const { first, last, ref } = useAttribution();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", vehicle: "", website: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    // A model we have goes by id; anything else is a suggestion.
    const model = models.find((option) => option.label === values.vehicle);
    start.mutate(
      {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        desiredModelId: model?.id ?? null,
        desiredVehicle: model ? null : values.vehicle || null,
        ref: ref || null,
        website: values.website,
        first,
        last,
      },
      {
        onSuccess: onStarted,
        onError: (error) =>
          setFormError(
            applyApiErrors(error, setError, ["name", "phone", "email"]),
          ),
      },
    );
  });

  return (
    <Form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />
      <FormField
        label="Seu nome"
        autoComplete="name"
        placeholder="Nome completo"
        error={errors.name?.message}
        {...register("name")}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <MaskedField
            label={phoneLabel}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(21) 99999-9999"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            mask={maskPhone}
            error={errors.phone?.message}
          />
        )}
      />
      <FormField
        label="E-mail (opcional)"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {models.length > 0 && (
        <Controller
          control={control}
          name="vehicle"
          render={({ field }) => (
            <CreatableCombobox
              label="Qual veículo você quer alugar?"
              value={field.value}
              options={models.map((model) => ({
                value: model.label,
                label: model.label,
              }))}
              onChange={field.onChange}
              placeholder="Escolha ou sugira um veículo"
              searchPlaceholder="Buscar ou sugerir…"
              createLabel="Sugerir"
            />
          )}
        />
      )}
      {formError && <Alert>{formError}</Alert>}
      <Box>
        <Button type="submit" className="w-full" disabled={start.isPending}>
          {start.isPending && <Spinner className="text-primary-foreground" />}
          {submitLabel}
        </Button>
      </Box>
    </Form>
  );
}

export function LeadStartFormSkeleton() {
  return (
    <Box className="space-y-4">
      {[0, 1, 2, 3].map((index) => (
        <Box key={index} className="space-y-2">
          <Skeleton shape="text" className="w-32 text-sm" />
          <Skeleton className="h-11 md:h-9" />
        </Box>
      ))}
      <Skeleton className="h-11 md:h-9" />
    </Box>
  );
}
