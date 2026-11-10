import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DateField } from "@/components/molecules/date-field";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import { applyApiErrors } from "@/helpers/form";
import { useCepLookup } from "@/hooks/api/comum/useCepLookup";
import type { QuestionnaireState, RegistrationInput } from "@/types/public-lead";
import { isValidCpf } from "@/utils/cpf";
import { brDateToDay, todayInBrasilia } from "@/utils/date";
import { maskCep, maskCpf, maskDate, maskPhone, maskRg, onlyDigits } from "@/utils/masks";

const optional = (max: number) => z.string().trim().max(max);

/** Mirrors the API's registration (the staff's customer rules + birth date). */
const schema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  document: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().refine((value) => {
    const day = brDateToDay(value);
    return day !== null && day <= todayInBrasilia() && day >= "1900-01-01";
  }, "Informe sua data de nascimento"),
  rg: optional(40),
  nationality: optional(60),
  maritalStatus: optional(40),
  profession: optional(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  phone: z
    .string()
    .refine((value) => [10, 11].includes(onlyDigits(value).length), "Telefone inválido"),
  zip: optional(12),
  addressLine: optional(200),
  addressNumber: optional(20),
  complement: optional(120),
  neighborhood: optional(120),
  city: optional(80),
  state: optional(40),
  driverLicense: optional(40),
  driverLicenseIssuedAt: z.string(),
  driverLicenseValidUntil: z.string(),
});

type Values = z.infer<typeof schema>;

const FIELDS = Object.keys(schema.shape) as (keyof Values)[];

type QuestionnaireRegistrationFormProps = {
  defaults: QuestionnaireState["defaults"];
  options: QuestionnaireState["options"];
  pending: boolean;
  /** Rejects with the API error, shown on the fields it names. */
  onSubmit: (input: RegistrationInput) => Promise<unknown>;
};

/**
 * Step 3: what the rental contract needs, filled in by the customer. The same
 * checks as the staff's customer form (CPF digit, e-mail); the CEP fills the
 * address. The CNH is optional: complete, it already unlocks the contract.
 */
export function QuestionnaireRegistrationForm({
  defaults,
  options,
  pending,
  onSubmit,
}: QuestionnaireRegistrationFormProps) {
  const cep = useCepLookup();
  const [cnh, setCnh] = useState<File[]>([]);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaults.name,
      document: "",
      birthDate: "",
      rg: "",
      nationality: options.defaultNationality,
      maritalStatus: "",
      profession: "",
      email: defaults.email,
      phone: maskPhone(defaults.phone),
      zip: "",
      addressLine: "",
      addressNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      driverLicense: "",
      driverLicenseIssuedAt: "",
      driverLicenseValidUntil: "",
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const lookupCep = (masked: string) => {
    if (onlyDigits(masked).length !== 8) return;
    cep.mutate(masked, {
      onSuccess: (address) => {
        if (!address) {
          setError("zip", { type: "server", message: "CEP não encontrado" });
          return;
        }
        setValue("addressLine", address.addressLine);
        setValue("neighborhood", address.neighborhood);
        setValue("city", address.city);
        setValue("state", address.state);
      },
    });
  };

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit({
        ...values,
        birthDate: brDateToDay(values.birthDate) ?? "",
        cnhFile: cnh[0] ?? null,
      });
    } catch (error) {
      // The API's 422 lands on the field it names; the rest is an alert.
      setFormError(applyApiErrors(error, setError, FIELDS));
    }
  });

  const masked = (
    name: keyof Values,
    label: string,
    mask: (value: string) => string,
    extra: { inputMode?: "numeric" | "tel"; placeholder?: string; after?: (v: string) => void } = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MaskedField
          label={label}
          value={field.value}
          onChange={(value) => {
            field.onChange(value);
            extra.after?.(value);
          }}
          onBlur={field.onBlur}
          mask={mask}
          inputMode={extra.inputMode}
          placeholder={extra.placeholder}
          error={errors[name]?.message}
        />
      )}
    />
  );

  const date = (name: "driverLicenseIssuedAt" | "driverLicenseValidUntil", label: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DateField
          label={label}
          value={field.value}
          onChange={field.onChange}
          clearable
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Form onSubmit={submit} noValidate className="space-y-8">
      <Box className="space-y-4">
        <Heading level={2} variant="section">
          Seus dados
        </Heading>
        <Row className="gap-y-4">
          <Col>
            <FormField
              label="Nome completo"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
          </Col>
          <Col sm={6}>
            {masked("document", "CPF", maskCpf, {
              inputMode: "numeric",
              placeholder: "000.000.000-00",
            })}
          </Col>
          <Col sm={6}>
            {masked("birthDate", "Data de nascimento", maskDate, {
              inputMode: "numeric",
              placeholder: "dd/mm/aaaa",
            })}
          </Col>
          <Col sm={6}>{masked("rg", "RG (opcional)", maskRg)}</Col>
          <Col sm={6}>
            <FormField
              label="Nacionalidade"
              error={errors.nationality?.message}
              {...register("nationality")}
            />
          </Col>
          <Col sm={6}>
            <Controller
              control={control}
              name="maritalStatus"
              render={({ field }) => (
                <SelectField
                  label="Estado civil"
                  placeholder="Selecione"
                  value={field.value}
                  options={options.maritalStatus.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  onChange={field.onChange}
                  error={errors.maritalStatus?.message}
                />
              )}
            />
          </Col>
          <Col sm={6}>
            <FormField
              label="Profissão"
              error={errors.profession?.message}
              {...register("profession")}
            />
          </Col>
          <Col sm={6}>
            <FormField
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </Col>
          <Col sm={6}>
            {masked("phone", "Telefone", maskPhone, {
              inputMode: "tel",
              placeholder: "(00) 00000-0000",
            })}
          </Col>
        </Row>
      </Box>

      <Box className="space-y-4">
        <Heading level={2} variant="section">
          Endereço
        </Heading>
        <Row className="gap-y-4">
          <Col sm={6}>
            {masked("zip", cep.isPending ? "CEP (buscando…)" : "CEP", maskCep, {
              inputMode: "numeric",
              placeholder: "00000-000",
              after: lookupCep,
            })}
          </Col>
          <Col sm={6}>
            <FormField label="Logradouro" error={errors.addressLine?.message} {...register("addressLine")} />
          </Col>
          <Col span={6}>
            <FormField label="Número" error={errors.addressNumber?.message} {...register("addressNumber")} />
          </Col>
          <Col span={6}>
            <FormField label="Complemento" error={errors.complement?.message} {...register("complement")} />
          </Col>
          <Col sm={6}>
            <FormField label="Bairro" error={errors.neighborhood?.message} {...register("neighborhood")} />
          </Col>
          <Col span={8} sm={4}>
            <FormField label="Cidade" error={errors.city?.message} {...register("city")} />
          </Col>
          <Col span={4} sm={2}>
            <FormField
              label="UF"
              maxLength={2}
              className="uppercase"
              error={errors.state?.message}
              {...register("state")}
            />
          </Col>
        </Row>
      </Box>

      <Box className="space-y-4">
        <Heading level={2} variant="section">
          CNH (opcional)
        </Heading>
        <Text tone="muted">
          Preencher adianta a emissão do contrato.
        </Text>
        <FilePicker
          label="Foto ou PDF da CNH"
          accept="application/pdf,image/*"
          files={cnh}
          onChange={setCnh}
          multiple={false}
        />
        <Row className="gap-y-4">
          <Col sm={4}>
            <FormField label="Número da CNH" error={errors.driverLicense?.message} {...register("driverLicense")} />
          </Col>
          <Col span={6} sm={4}>
            {date("driverLicenseIssuedAt", "Emissão")}
          </Col>
          <Col span={6} sm={4}>
            {date("driverLicenseValidUntil", "Validade")}
          </Col>
        </Row>
      </Box>

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner className="text-primary-foreground" />}
        Enviar meus dados
      </Button>
    </Form>
  );
}
