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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import {
  maskPartnerDocument,
  PARTNER_FORM_FIELDS,
  partnerFormDefaults,
  partnerFormSchema,
  toPartnerInput,
  type PartnerFormValues,
} from "./schema";
import { applyApiErrors } from "@/helpers/form";
import { useSavePartner } from "@/hooks/api/gestao/partners/usePartnerMutations";
import type { Partner, PartnerDetail } from "@/types/partner";
import { maskPhone } from "@/utils/masks";

const DOCUMENT_TYPES = [
  { value: "CPF", label: "Pessoa (CPF)" },
  { value: "CNPJ", label: "Empresa (CNPJ)" },
];

type PartnerFormProps = {
  partner?: PartnerDetail;
  cancelTo: string;
  onSaved: (partner: Partner) => void;
};

export function PartnerForm({ partner, cancelTo, onSaved }: PartnerFormProps) {
  const save = useSavePartner(partner?.id);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: partnerFormDefaults(partner),
  });
  const documentType = watch("documentType");
  const isCompany = documentType === "CNPJ";

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(toPartnerInput(values), {
      onSuccess: onSaved,
      onError: (error) =>
        setFormError(applyApiErrors(error, setError, PARTNER_FORM_FIELDS)),
    });
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Row className="gap-y-4">
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="documentType"
                render={({ field }) => (
                  <SegmentedField
                    label="Tipo"
                    value={field.value}
                    options={DOCUMENT_TYPES}
                    onChange={(value) => {
                      field.onChange(value);
                      // Re-mask what was typed for the new type.
                      setValue(
                        "document",
                        maskPartnerDocument(value, watch("document")),
                      );
                    }}
                    error={errors.documentType?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="document"
                render={({ field }) => (
                  <MaskedField
                    label={isCompany ? "CNPJ" : "CPF"}
                    inputMode={isCompany ? "text" : "numeric"}
                    autoCapitalize={isCompany ? "characters" : undefined}
                    placeholder={
                      isCompany ? "00.000.000/0000-00" : "000.000.000-00"
                    }
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mask={(value) => maskPartnerDocument(documentType, value)}
                    error={errors.document?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label={isCompany ? "Razão social" : "Nome"}
                autoComplete={isCompany ? "organization" : "name"}
                error={errors.name?.message}
                {...register("name")}
              />
            </Col>
            {isCompany && (
              <Col md={6} lg={4}>
                <FormField
                  label="Nome fantasia (opcional)"
                  error={errors.tradeName?.message}
                  {...register("tradeName")}
                />
              </Col>
            )}
            <Col md={6} lg={4}>
              <FormField
                label="E-mail (login da área do parceiro)"
                type="email"
                inputMode="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <MaskedField
                    label="Telefone (opcional)"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mask={maskPhone}
                    error={errors.phone?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={isCompany ? 6 : 4}>
              <FormField
                label="Chave pix para o repasse (opcional)"
                error={errors.pixKey?.message}
                {...register("pixKey")}
              />
            </Col>
            <Col>
              <TextareaField
                label="Observações (opcional)"
                rows={3}
                error={errors.notes?.message}
                {...register("notes")}
              />
            </Col>
            <Col>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <CheckboxField
                    label="Ativo"
                    hint="Parceiro inativo não entra na área do parceiro."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
          </Row>

          <Alert variant="info" role="note">
            O repasse ao parceiro é sempre feito por fora: o sistema não paga
            nada. A chave pix fica aqui só para consulta.
          </Alert>
          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {partner ? "Salvar alterações" : "Cadastrar parceiro"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function PartnerFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Row className="gap-y-4">
          {([4, 4, 4, 4, 4, 4] as const).map((lg, index) => (
            <Col key={index} md={6} lg={lg} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-28 text-sm" />
            <Skeleton className="h-20" />
          </Col>
          <Col>
            <Skeleton shape="text" className="w-40 text-sm" />
          </Col>
        </Row>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-40 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
