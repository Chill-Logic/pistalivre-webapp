import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Form } from "@/components/atoms/form";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { FormField } from "@/components/molecules/form-field";
import { InfoItem } from "@/components/molecules/info-item";
import { MaskedField } from "@/components/molecules/masked-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useUpdatePartnerProfile } from "@/hooks/api/parceiro/account/useUpdatePartnerProfile";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaProfile } from "@/types/partner-area";
import { maskPhone, onlyDigits } from "@/utils/masks";

type Errors = { phone?: string; pixKey?: string; form?: string };

/**
 * The partner's data: name, login and document type come from the staff;
 * the phone and the pix key are the partner's to change.
 */
export function PartnerAreaProfileForm({
  profile,
}: {
  profile: PartnerAreaProfile;
}) {
  const { label } = useLabels();
  const update = useUpdatePartnerProfile();
  const [phone, setPhone] = useState(maskPhone(profile.phone ?? ""));
  const [pixKey, setPixKey] = useState(profile.pixKey ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const unchanged =
    onlyDigits(phone) === (profile.phone ?? "") &&
    pixKey.trim() === (profile.pixKey ?? "");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const digits = onlyDigits(phone);
    if (digits && digits.length < 10) {
      setErrors({ phone: "Telefone incompleto: DDD e número" });
      return;
    }
    setErrors({});
    update.mutate(
      { phone: digits || null, pixKey: pixKey.trim() || null },
      {
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            phone: fields.phone,
            pixKey: fields.pixKey,
            form: fields.phone || fields.pixKey ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Seus dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Nome" span={12}>
            {profile.tradeName
              ? `${profile.name} (${profile.tradeName})`
              : profile.name}
          </InfoItem>
          <InfoItem label="E-mail (login)" span={12} sm={7}>
            {profile.email}
          </InfoItem>
          <InfoItem label="Documento" span={12} sm={5}>
            {label(LABEL_MAPS.partnerDocumentType, profile.documentType)}
          </InfoItem>
        </Row>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <MaskedField
            label="Telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            mask={maskPhone}
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            disabled={update.isPending}
          />
          <FormField
            label="Chave pix"
            autoComplete="off"
            placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
            maxLength={140}
            value={pixKey}
            onChange={(event) => setPixKey(event.target.value)}
            error={errors.pixKey}
            disabled={update.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <Box className="flex justify-end">
            <Button
              type="submit"
              disabled={update.isPending || unchanged}
              className="w-full sm:w-auto"
            >
              {update.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function PartnerAreaProfileFormSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Row className="gap-y-4">
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-12 text-xs" />
            <Skeleton shape="text" className="w-40 text-sm" />
          </Col>
          <Col sm={7} className="space-y-2">
            <Skeleton shape="text" className="w-20 text-xs" />
            <Skeleton shape="text" className="w-48 text-sm" />
          </Col>
          <Col sm={5} className="space-y-2">
            <Skeleton shape="text" className="w-20 text-xs" />
            <Skeleton shape="text" className="w-24 text-sm" />
          </Col>
        </Row>
        <Box className="space-y-4">
          {[0, 1].map((index) => (
            <Box key={index} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-sm" />
              <Skeleton className="h-10 w-full" />
            </Box>
          ))}
          <Box className="flex justify-end">
            <Skeleton className="h-10 w-full sm:w-24" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
