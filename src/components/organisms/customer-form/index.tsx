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
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import {
  CUSTOMER_FORM_FIELDS,
  customerFormDefaults,
  customerFormSchema,
  toCustomerInput,
  type CustomerFormValues,
} from "./schema";
import { MARITAL_STATUSES } from "@/constants/customer";
import { applyApiErrors } from "@/helpers/form";
import { useCepLookup } from "@/hooks/api/comum/useCepLookup";
import { useSaveCustomer } from "@/hooks/api/gestao/customers/useSaveCustomer";
import type { CustomerDetail } from "@/types/customer";
import {
  maskCep,
  maskCpf,
  maskDate,
  maskPhone,
  maskRg,
  onlyDigits,
} from "@/utils/masks";

const MARITAL_OPTIONS = MARITAL_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const CONFLICT_FIELDS = { cpf: "document", "e-mail": "email" } as const;

type CustomerFormProps = {
  customer?: CustomerDetail;
  /** Prefill for a new customer (e.g. converting a lead). */
  prefill?: Partial<CustomerFormValues>;
  cancelTo: string;
  onSaved: (customer: CustomerDetail) => void;
  /** Converting a lead into this customer. */
  leadId?: string;
};

export function CustomerForm({
  customer,
  prefill,
  cancelTo,
  onSaved,
  leadId,
}: CustomerFormProps) {
  const save = useSaveCustomer(customer?.id);
  const cep = useCepLookup();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerFormDefaults(customer, prefill),
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
    save.mutate(
      { ...toCustomerInput(values), ...(leadId ? { leadId } : {}) },
      {
        onSuccess: (result) => onSaved(result.customer),
        onError: (error) =>
          setFormError(
            applyApiErrors(error, setError, CUSTOMER_FORM_FIELDS, {
              conflictFields: CONFLICT_FIELDS,
            }),
          ),
      },
    );
  });

  const masked = (
    name: keyof CustomerFormValues,
    label: string,
    mask: (value: string) => string,
    extra: {
      inputMode?: "numeric" | "tel";
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
              Dados pessoais
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <FormField
                  label="Nome"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </Col>
              <Col md={6} lg={3}>
                {masked("document", "CPF", maskCpf, {
                  inputMode: "numeric",
                  placeholder: "000.000.000-00",
                })}
              </Col>
              <Col md={6} lg={3}>
                {masked("rg", "RG", maskRg)}
              </Col>
              <Col md={6}>
                <FormField
                  label="E-mail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </Col>
              <Col md={6} lg={3}>
                {masked("phone", "Telefone", maskPhone, {
                  inputMode: "tel",
                  placeholder: "(00) 00000-0000",
                })}
              </Col>
              <Col md={6} lg={3}>
                {masked("birthDate", "Nascimento", maskDate, {
                  inputMode: "numeric",
                  placeholder: "dd/mm/aaaa",
                })}
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <SelectField
                      label="Estado civil"
                      value={field.value}
                      options={MARITAL_OPTIONS}
                      onChange={field.onChange}
                      error={errors.maritalStatus?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Profissão"
                  error={errors.profession?.message}
                  {...register("profession")}
                />
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

          <Box className="space-y-4">
            <Heading level={2} variant="section">
              Contato de emergência
            </Heading>
            <Row className="gap-y-4">
              <Col md={6}>
                <FormField
                  label="Nome — opcional"
                  error={errors.emergencyContactName?.message}
                  {...register("emergencyContactName")}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Vínculo — opcional"
                  placeholder="Mãe, cônjuge…"
                  error={errors.emergencyContactRelation?.message}
                  {...register("emergencyContactRelation")}
                />
              </Col>
              <Col md={6}>
                {masked(
                  "emergencyContactPhone",
                  "Telefone — opcional",
                  maskPhone,
                  { inputMode: "tel" },
                )}
              </Col>
              <Col md={6}>
                <FormField
                  label="E-mail — opcional"
                  type="email"
                  inputMode="email"
                  error={errors.emergencyContactEmail?.message}
                  {...register("emergencyContactEmail")}
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
              {customer ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function CustomerFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 md:pt-6">
        {[8, 7, 4].map((fields, section) => (
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
