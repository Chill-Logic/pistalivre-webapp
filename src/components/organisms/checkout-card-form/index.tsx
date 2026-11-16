import { CreditCard, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import {
  CreditCardPreview,
  type CreditCardField,
} from "@/components/atoms/credit-card-preview";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import { toApiError } from "@/helpers/api-error";
import { usePayWithCard } from "@/hooks/api/cliente/public-pay/usePublicPay";
import type { CardInstallmentOption } from "@/types/payment-link";
import { formatCurrency } from "@/utils/format";
import {
  maskCardExpiry,
  maskCardNumber,
  maskCep,
  maskCpfCnpj,
  maskPhone,
  onlyDigits,
} from "@/utils/masks";

const optionLabel = (o: CardInstallmentOption) =>
  o.installments === 1
    ? `1× de ${formatCurrency(o.total)} (sem juros)`
    : `${o.installments}× de ${formatCurrency(o.perInstallment)} · total ${formatCurrency(o.total)}`;

type Fields = {
  number: string;
  holderName: string;
  expiry: string;
  ccv: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  postalCode: string;
  addressNumber: string;
};

const EMPTY: Fields = {
  number: "",
  holderName: "",
  expiry: "",
  ccv: "",
  name: "",
  cpfCnpj: "",
  email: "",
  phone: "",
  postalCode: "",
  addressNumber: "",
};

/** API field → this form's field (the API reports `card.number`, `holderInfo.email`…). */
const FIELD_OF: Record<string, keyof Fields> = {
  "card.number": "number",
  "card.holderName": "holderName",
  "card.expiryMonth": "expiry",
  "card.expiryYear": "expiry",
  "card.ccv": "ccv",
  "holderInfo.name": "name",
  "holderInfo.cpfCnpj": "cpfCnpj",
  "holderInfo.email": "email",
  "holderInfo.phone": "phone",
  "holderInfo.postalCode": "postalCode",
  "holderInfo.addressNumber": "addressNumber",
};

/**
 * Card of the checkout. The installments come with the interest already in
 * (computed by the server). The card number only goes to the server, which
 * passes it to the payment provider and keeps nothing.
 */
export function CheckoutCardForm({
  token,
  options,
  blocked,
}: {
  token: string;
  options: CardInstallmentOption[];
  blocked: boolean;
}) {
  const pay = usePayWithCard(token);
  const [installments, setInstallments] = useState("1");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  // Which field of the card is being typed: the drawing turns to show it.
  const [focused, setFocused] = useState<CreditCardField | null>(null);
  const chosen =
    options.find((o) => String(o.installments) === installments) ?? options[0];

  if (blocked) {
    return (
      <Alert>
        Este link recebeu muitas tentativas recusadas no cartão. Pague por PIX
        ou fale com a locadora.
      </Alert>
    );
  }

  const set = (key: keyof Fields) => (value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (pay.isPending) return;
    const [month = "", year = ""] = fields.expiry.split("/");
    setFormError(null);
    pay.mutate(
      {
        installments: Number(installments),
        card: {
          holderName: fields.holderName,
          number: fields.number,
          expiryMonth: month,
          expiryYear: year,
          ccv: fields.ccv,
        },
        holderInfo: {
          name: fields.name,
          email: fields.email,
          cpfCnpj: fields.cpfCnpj,
          postalCode: fields.postalCode,
          addressNumber: fields.addressNumber,
          phone: fields.phone,
        },
      },
      {
        onError: (err) => {
          const apiError = toApiError(err);
          const next: Partial<Record<keyof Fields, string>> = {};
          for (const [key, message] of Object.entries(apiError.fields ?? {})) {
            const field = FIELD_OF[key];
            if (field) next[field] = message;
          }
          setErrors(next);
          setFormError(apiError.message);
          // Never keep the security code after a refusal.
          setFields((current) => ({ ...current, ccv: "" }));
        },
      },
    );
  };

  return (
    <Form onSubmit={onSubmit} noValidate>
      {/* Desktop: what is being paid (installments + the card drawn) on the
          left, the form on the right; one column on the phone. */}
      <Row className="gap-y-5">
        <Col lg={5} className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <SelectField
            label="Parcelas"
            value={installments}
            options={options.map((o) => ({
              value: String(o.installments),
              label: optionLabel(o),
            }))}
            onChange={setInstallments}
          />
          {chosen && chosen.interest > 0 && (
            <Text size="xs" tone="muted">
              Juros do parcelamento: {formatCurrency(chosen.interest)}. No PIX
              você paga só o saldo.
            </Text>
          )}
          <CreditCardPreview
            number={fields.number}
            name={fields.holderName}
            expiry={fields.expiry}
            cvc={fields.ccv}
            focused={focused}
            className="py-2"
          />
        </Col>
        <Col lg={7} className="space-y-5">
          <Box className="space-y-3">
            <Heading level={3} variant="section">
              Cartão
            </Heading>
            <Row className="gap-y-3">
              <Col md={7}>
                <MaskedField
                  label="Número do cartão"
                  onFocus={() => setFocused("number")}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={fields.number}
                  onChange={set("number")}
                  mask={maskCardNumber}
                  error={errors.number}
                />
              </Col>
              <Col span={6} md={3}>
                <MaskedField
                  label="Validade (MM/AA)"
                  onFocus={() => setFocused("expiry")}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={fields.expiry}
                  onChange={set("expiry")}
                  mask={maskCardExpiry}
                  error={errors.expiry}
                />
              </Col>
              <Col span={6} md={2}>
                <MaskedField
                  label="CVV"
                  onFocus={() => setFocused("cvc")}
                  onBlur={() => setFocused(null)}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={fields.ccv}
                  onChange={set("ccv")}
                  mask={(v) => onlyDigits(v).slice(0, 4)}
                  error={errors.ccv}
                />
              </Col>
              <Col>
                <FormField
                  label="Nome impresso no cartão"
                  onFocus={() => setFocused("name")}
                  autoComplete="cc-name"
                  value={fields.holderName}
                  onChange={(e) =>
                    set("holderName")(e.target.value.toUpperCase())
                  }
                  error={errors.holderName}
                />
              </Col>
            </Row>
          </Box>

          <Box className="space-y-3">
            <Heading level={3} variant="section">
              Titular do cartão
            </Heading>
            <Row className="gap-y-3">
              <Col md={6}>
                <FormField
                  label="Nome completo"
                  autoComplete="name"
                  value={fields.name}
                  onChange={(e) => set("name")(e.target.value)}
                  error={errors.name}
                />
              </Col>
              <Col md={6}>
                <MaskedField
                  label="CPF ou CNPJ"
                  inputMode="numeric"
                  value={fields.cpfCnpj}
                  onChange={set("cpfCnpj")}
                  mask={maskCpfCnpj}
                  error={errors.cpfCnpj}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="E-mail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={(e) => set("email")(e.target.value)}
                  error={errors.email}
                />
              </Col>
              <Col md={6}>
                <MaskedField
                  label="Celular"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.phone}
                  onChange={set("phone")}
                  mask={maskPhone}
                  error={errors.phone}
                />
              </Col>
              <Col span={7} md={6}>
                <MaskedField
                  label="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={fields.postalCode}
                  onChange={set("postalCode")}
                  mask={maskCep}
                  error={errors.postalCode}
                />
              </Col>
              <Col span={5} md={6}>
                <FormField
                  label="Número"
                  value={fields.addressNumber}
                  onChange={(e) => set("addressNumber")(e.target.value)}
                  error={errors.addressNumber}
                />
              </Col>
            </Row>
          </Box>

          {formError && <Alert>{formError}</Alert>}
          <Button type="submit" className="w-full" disabled={pay.isPending}>
            {pay.isPending ? (
              <Spinner className="text-primary-foreground" />
            ) : (
              <CreditCard />
            )}
            {chosen ? `Pagar ${formatCurrency(chosen.total)}` : "Pagar"}
          </Button>
          <Text
            size="xs"
            tone="muted"
            className="flex items-center justify-center gap-1"
          >
            <Lock className="size-3" />
            Pagamento seguro: os dados do seu cartão não ficam guardados com a gente.
          </Text>
        </Col>
      </Row>
    </Form>
  );
}
