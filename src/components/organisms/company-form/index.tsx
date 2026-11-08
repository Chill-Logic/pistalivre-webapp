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
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import {
  COMPANY_FORM_FIELDS,
  COMPANY_MESSAGE_FIELDS,
  companyFormDefaults,
  companyFormSchema,
  toCompanyInput,
  type CompanyFormValues,
} from "./schema";
import { applyApiErrors } from "@/helpers/form";
import { useCepLookup } from "@/hooks/api/comum/useCepLookup";
import { useUpdateCompany } from "@/hooks/api/gestao/company/useUpdateCompany";
import type { Company } from "@/types/company";
import { maskCep, maskCnpj, maskPhone, onlyDigits } from "@/utils/masks";

type CompanyFormProps = {
  company: Company;
  cancelTo: string;
  onSaved: (company: Company) => void;
};

/** Registration data (the one used on contracts). */
export function CompanyForm({ company, cancelTo, onSaved }: CompanyFormProps) {
  const save = useUpdateCompany();
  const cep = useCepLookup();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: companyFormDefaults(company),
  });

  /** Fill the address once the 8 CEP digits are in. */
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

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toCompanyInput(values), {
      onSuccess: onSaved,
      onError: (error) => {
        const message = applyApiErrors(error, setError, COMPANY_FORM_FIELDS);
        if (!message) return;
        // The domain answers with a message only: place it by its keyword.
        const lower = message.toLowerCase();
        const field = Object.entries(COMPANY_MESSAGE_FIELDS).find(([word]) =>
          lower.includes(word),
        )?.[1];
        if (field) setError(field, { type: "server", message });
        else setFormError(message);
      },
    });
  });

  const masked = (
    name: keyof CompanyFormValues,
    label: string,
    mask: (value: string) => string,
    extra: {
      inputMode?: "numeric" | "tel" | "text";
      placeholder?: string;
      after?: (v: string) => void;
    } = {},
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

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-8">
          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Dados cadastrais
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <FormField
                  label="Razão social"
                  error={errors.legalName?.message}
                  {...register("legalName")}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Nome fantasia"
                  error={errors.tradeName?.message}
                  {...register("tradeName")}
                />
              </Col>
              <Col md={6}>
                {masked("document", "CNPJ", maskCnpj, {
                  inputMode: "text",
                  placeholder: "00.000.000/0000-00",
                })}
              </Col>
              <Col md={6}>
                <FormField
                  label="Representante legal — opcional"
                  autoComplete="name"
                  error={errors.representative?.message}
                  {...register("representative")}
                />
              </Col>
            </Row>
          </Box>

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Contato
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <FormField
                  label="E-mail — opcional"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </Col>
              <Col span={6} md={3}>
                {masked("phone", "Telefone", maskPhone, {
                  inputMode: "tel",
                  placeholder: "(00) 0000-0000",
                })}
              </Col>
              <Col span={6} md={3}>
                {masked("whatsapp", "WhatsApp", maskPhone, {
                  inputMode: "tel",
                  placeholder: "(00) 00000-0000",
                })}
              </Col>
              <Col>
                <Text size="xs" tone="muted">
                  O WhatsApp de atendimento recebe a mensagem do cliente ao
                  concluir o questionário, com o resumo do que ele escolheu.
                  Sem ele, o questionário só agradece e a equipe procura o
                  cliente.
                </Text>
              </Col>
            </Row>
          </Box>

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Endereço
            </Heading>
            <Row className="gap-y-4">
              <Col md={4} lg={3}>
                {masked("zip", "CEP", maskCep, {
                  inputMode: "numeric",
                  placeholder: "00000-000",
                  after: lookupCep,
                })}
              </Col>
              <Col md={8} lg={6}>
                <FormField
                  label="Logradouro"
                  error={errors.addressLine?.message}
                  {...register("addressLine")}
                />
              </Col>
              <Col span={6} md={4} lg={3}>
                <FormField
                  label="Número"
                  error={errors.addressNumber?.message}
                  {...register("addressNumber")}
                />
              </Col>
              <Col span={6} md={8} lg={4}>
                <FormField
                  label="Complemento"
                  error={errors.complement?.message}
                  {...register("complement")}
                />
              </Col>
              <Col md={6} lg={3}>
                <FormField
                  label="Bairro"
                  error={errors.neighborhood?.message}
                  {...register("neighborhood")}
                />
              </Col>
              <Col span={8} md={4} lg={3}>
                <FormField
                  label="Cidade"
                  error={errors.city?.message}
                  {...register("city")}
                />
              </Col>
              <Col span={4} md={2} lg={2}>
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

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar alterações
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function CompanyFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        {[4, 3, 7].map((fields, section) => (
          <Box key={section} className="space-y-4">
            <Skeleton shape="text" className="w-40 text-base" />
            <Row className="gap-y-4">
              {Array.from({ length: fields }, (_, index) => (
                <Col
                  key={index}
                  md={6}
                  lg={index % 2 ? 3 : 6}
                  className="space-y-2"
                >
                  <Skeleton shape="text" className="w-20 text-sm" />
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
