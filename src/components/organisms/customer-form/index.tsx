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
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import { CustomerDocumentReader } from "@/components/organisms/customer-document-reader";
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
import { useCustomerDocumentReadEnabled } from "@/hooks/api/gestao/customers/useCustomerDocumentReader";
import { useSaveCustomer } from "@/hooks/api/gestao/customers/useSaveCustomer";
import { useAiFormFill, type AiFillStep } from "@/hooks/ui/useAiFormFill";
import { customersService } from "@/services/api/gestao/customers.service";
import { documentsService } from "@/services/api/gestao/documents.service";
import type { CustomerDetail, CustomerDocumentResult } from "@/types/customer";
import { dayToBrDate } from "@/utils/date";
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

/** Where each read document goes among the customer's documents (category slug). */
const DOCUMENT_CATEGORY: Record<CustomerDocumentResult["kind"], string> = {
  cnh: "cnh",
  rg: "rg",
  comprovante: "comprovante-de-residencia",
  outro: "outro",
};

type ReadDocument = { file: File; kind: CustomerDocumentResult["kind"] };

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
  const readEnabled = useCustomerDocumentReadEnabled();
  const [formError, setFormError] = useState<string | null>(null);
  // Read documents: saved under the new customer (files + CNH) after it's created.
  const [readDocuments, setReadDocuments] = useState<ReadDocument[]>([]);
  const [license, setLicense] =
    useState<CustomerDocumentResult["license"]>(null);
  const [finishing, setFinishing] = useState(false);
  const [savedWithIssues, setSavedWithIssues] = useState<{
    customer: CustomerDetail;
    issues: string[];
  } | null>(null);

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

  // "Preencher na tela" from the chat: field by field, with where each came from.
  const aiFill = useAiFormFill("customer", ({ values, origins }) => {
    const text = (key: string) =>
      typeof values[key] === "string" && values[key] ? String(values[key]) : "";
    const steps: AiFillStep[] = [];
    const add = (
      name: keyof CustomerFormValues,
      label: string,
      value: string,
      origin = origins[name],
    ) => {
      if (!value) return;
      steps.push({
        label,
        origin,
        apply: () =>
          setValue(name, value, { shouldDirty: true, shouldValidate: true }),
      });
    };
    add("name", "Nome", text("name"));
    add(
      "document",
      "CPF",
      text("document") && maskCpf(onlyDigits(text("document"))),
    );
    add("rg", "RG", text("rg") && maskRg(text("rg")));
    add("email", "E-mail", text("email"));
    add(
      "phone",
      "Telefone",
      text("phone") && maskPhone(onlyDigits(text("phone"))),
    );
    add(
      "birthDate",
      "Nascimento",
      text("birthDate") && dayToBrDate(text("birthDate").slice(0, 10)),
    );
    add("profession", "Profissão", text("profession"));
    add("zip", "CEP", text("zip") && maskCep(onlyDigits(text("zip"))));
    add("addressLine", "Logradouro", text("addressLine"));
    add("addressNumber", "Número", text("addressNumber"));
    add("complement", "Complemento", text("complement"));
    add("neighborhood", "Bairro", text("neighborhood"));
    add("city", "Cidade", text("city"));
    add("state", "UF", text("state"));
    return steps;
  });

  /** The form fills with what the document had (the person checks before saving). */
  const fillFromDocument = (result: CustomerDocumentResult, file: File) => {
    const { fields } = result;
    const set = (name: keyof CustomerFormValues, value: string | undefined) => {
      if (value)
        setValue(name, value, { shouldDirty: true, shouldValidate: true });
    };
    set("name", fields.name);
    set("document", fields.document && maskCpf(fields.document));
    set("rg", fields.rg && maskRg(fields.rg));
    set("birthDate", fields.birthDate && dayToBrDate(fields.birthDate));
    set("zip", fields.zip && maskCep(fields.zip));
    set("addressLine", fields.addressLine);
    set("addressNumber", fields.addressNumber);
    set("complement", fields.complement);
    set("neighborhood", fields.neighborhood);
    set("city", fields.city);
    set("state", fields.state);
    if (result.license) setLicense(result.license);
    if (result.kind !== "outro") {
      setReadDocuments((list) => [...list, { file, kind: result.kind }]);
    }
  };

  /** After creating: the read files go to the customer's documents, the CNH to the record. */
  const finish = async (saved: CustomerDetail) => {
    const issues: string[] = [];
    if (readDocuments.length) {
      const categories = await documentsService
        .categories("CUSTOMER")
        .catch(() => []);
      for (const { file, kind } of readDocuments) {
        const category = categories.find(
          (c) => c.slug === DOCUMENT_CATEGORY[kind],
        );
        await documentsService
          .upload({ type: "CUSTOMER", id: saved.id }, file, category?.id)
          .catch(() =>
            issues.push(
              `O arquivo ${file.name} não foi guardado: anexe em Documentos.`,
            ),
          );
      }
    }
    if (license) {
      await customersService
        .saveLicense(saved.id, {
          driverLicense: license.number,
          issuedAt: license.issuedAt,
          validUntil: license.validUntil,
        })
        .catch(() =>
          issues.push("A CNH lida não foi salva: informe ao gerar o contrato."),
        );
    }
    return issues;
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(
      { ...toCustomerInput(values), ...(leadId ? { leadId } : {}) },
      {
        onSuccess: async (result) => {
          // Came from the chat: the CNH and the chat's files are saved by it.
          if (aiFill.active) await aiFill.fulfill(result.customer.id);
          if (customer || (!readDocuments.length && !license)) {
            onSaved(result.customer);
            return;
          }
          setFinishing(true);
          const issues = await finish(result.customer);
          setFinishing(false);
          if (issues.length)
            setSavedWithIssues({ customer: result.customer, issues });
          else onSaved(result.customer);
        },
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
          {!customer && readEnabled.data && (
            <CustomerDocumentReader
              onRead={fillFromDocument}
              disabled={save.isPending || finishing}
            />
          )}
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
          {savedWithIssues && (
            <Alert variant="warning" className="space-y-2">
              <Text size="sm">Cliente cadastrado, mas:</Text>
              <List className="list-disc space-y-0.5 pl-5">
                {savedWithIssues.issues.map((issue) => (
                  <ListItem key={issue}>{issue}</ListItem>
                ))}
              </List>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onSaved(savedWithIssues.customer)}
              >
                Ir para o cliente
              </Button>
            </Alert>
          )}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={save.isPending || finishing || Boolean(savedWithIssues)}
            >
              {(save.isPending || finishing) && (
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
