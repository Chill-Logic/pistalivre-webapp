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
import { toApiError } from "@/helpers/api-error";
import type { PreRegistrationInput, QuestionnaireState } from "@/types/public-lead";
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

/** What the contract prints: required in the pre-registration (the API says the same). */
const CONTRACT_FIELDS: [keyof Values, string][] = [
  ["maritalStatus", "Escolha seu estado civil"],
  ["profession", "Informe sua profissão"],
  ["zip", "Informe o CEP"],
  ["addressLine", "Informe a rua"],
  ["addressNumber", "Informe o número"],
  ["neighborhood", "Informe o bairro"],
  ["city", "Informe a cidade"],
  ["state", "Informe o estado (UF)"],
  ["driverLicense", "Informe o número da CNH"],
  ["driverLicenseIssuedAt", "Informe a data de emissão"],
  ["driverLicenseValidUntil", "Informe a validade"],
];

const preRegistrationSchema = schema.superRefine((values, ctx) => {
  for (const [field, message] of CONTRACT_FIELDS) {
    if (!String(values[field] ?? "").trim()) ctx.addIssue({ code: "custom", path: [field], message });
  }
});

const MAX_OTHER_FILES = 3;
const DOCUMENT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

type FileErrors = Partial<Record<"cnhFile" | "proofOfAddressFile" | "otherFiles", string>>;

type QuestionnaireRegistrationFormProps = {
  /** "pre-registration" (/pre-cadastro): everything the contract needs is required, plus the documents. */
  variant?: "questionnaire" | "pre-registration";
  defaults?: QuestionnaireState["defaults"];
  options: Pick<QuestionnaireState["options"], "maritalStatus" | "defaultNationality">;
  pending: boolean;
  submitLabel?: string;
  /** Rejects with the API error, shown on the fields it names. */
  onSubmit: (input: PreRegistrationInput) => Promise<unknown>;
};

/**
 * What the rental contract needs, filled in by the customer. The same checks
 * as the staff's customer form (CPF digit, e-mail); the CEP fills the address.
 * In the questionnaire (step 3) the CNH is optional; in the pre-registration
 * the address, marital status, profession, CNH data and the documents (CNH +
 * proof of address, up to 3 more) are required.
 */
export function QuestionnaireRegistrationForm({
  variant = "questionnaire",
  defaults = { name: "", email: "", phone: "" },
  options,
  pending,
  submitLabel = "Enviar meus dados",
  onSubmit,
}: QuestionnaireRegistrationFormProps) {
  const pre = variant === "pre-registration";
  const cep = useCepLookup();
  const [cnh, setCnh] = useState<File[]>([]);
  const [proof, setProof] = useState<File[]>([]);
  const [others, setOthers] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<FileErrors>({});
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(pre ? preRegistrationSchema : schema),
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

  const missingFiles = (): FileErrors => {
    if (!pre) return {};
    const missing: FileErrors = {};
    if (!cnh.length) missing.cnhFile = "Anexe a foto ou o PDF da CNH";
    if (!proof.length) missing.proofOfAddressFile = "Anexe o comprovante de residência";
    if (others.length > MAX_OTHER_FILES) missing.otherFiles = `No máximo ${MAX_OTHER_FILES} arquivos`;
    return missing;
  };

  const submit = handleSubmit(
    async (values) => {
      setFormError(null);
      const missing = missingFiles();
      setFileErrors(missing);
      if (Object.keys(missing).length) return;
      try {
        await onSubmit({
          ...values,
          birthDate: brDateToDay(values.birthDate) ?? "",
          cnhFile: cnh[0] ?? null,
          proofOfAddressFile: proof[0] ?? null,
          otherFiles: others,
        });
      } catch (error) {
        // The API's 422 lands on the field it names (files included); the rest is an alert.
        const fields = toApiError(error).fields ?? {};
        setFileErrors({
          cnhFile: fields.cnhFile,
          proofOfAddressFile: fields.proofOfAddressFile,
          otherFiles: fields.otherFiles,
        });
        setFormError(applyApiErrors(error, setError, FIELDS));
      }
    },
    // Field errors show on the fields; the documents are checked on the same click.
    () => setFileErrors(missingFiles()),
  );

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
          {pre ? "CNH" : "CNH (opcional)"}
        </Heading>
        <Text tone="muted">
          {pre
            ? "Foto legível da CNH (frente e verso) ou o PDF da CNH digital, e os dados como estão nela."
            : "Preencher adianta a emissão do contrato."}
        </Text>
        <Box className="space-y-1">
          <FilePicker
            label={pre ? "Anexar a CNH" : "Foto ou PDF da CNH"}
            accept={pre ? DOCUMENT_ACCEPT : "application/pdf,image/*"}
            files={cnh}
            onChange={(files) => {
              setCnh(files);
              setFileErrors((current) => ({ ...current, cnhFile: undefined }));
            }}
            multiple={false}
          />
          {fileErrors.cnhFile && (
            <Text size="xs" tone="destructive">
              {fileErrors.cnhFile}
            </Text>
          )}
        </Box>
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

      {pre && (
        <Box className="space-y-4">
          <Heading level={2} variant="section">
            Comprovante de residência
          </Heading>
          <Text tone="muted">
            Conta de luz, água, gás, internet ou telefone, de preferência dos últimos 3 meses.
          </Text>
          <Box className="space-y-1">
            <FilePicker
              label="Anexar o comprovante"
              accept={DOCUMENT_ACCEPT}
              files={proof}
              onChange={(files) => {
                setProof(files);
                setFileErrors((current) => ({ ...current, proofOfAddressFile: undefined }));
              }}
              multiple={false}
            />
            {fileErrors.proofOfAddressFile && (
              <Text size="xs" tone="destructive">
                {fileErrors.proofOfAddressFile}
              </Text>
            )}
          </Box>
        </Box>
      )}

      {pre && (
        <Box className="space-y-4">
          <Heading level={2} variant="section">
            Outros documentos (opcional)
          </Heading>
          <Text tone="muted">
            Se a gente pediu algo a mais (RG, comprovante de renda…), anexe aqui. Até {MAX_OTHER_FILES} arquivos.
          </Text>
          <Box className="space-y-1">
            <FilePicker
              label="Anexar documentos"
              accept={DOCUMENT_ACCEPT}
              files={others}
              onChange={(files) => {
                setOthers(files.slice(0, MAX_OTHER_FILES));
                setFileErrors((current) => ({ ...current, otherFiles: undefined }));
              }}
            />
            {fileErrors.otherFiles && (
              <Text size="xs" tone="destructive">
                {fileErrors.otherFiles}
              </Text>
            )}
          </Box>
        </Box>
      )}

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner className="text-primary-foreground" />}
        {submitLabel}
      </Button>
    </Form>
  );
}
