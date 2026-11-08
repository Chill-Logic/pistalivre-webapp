import { useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { toApiError } from "@/helpers/api-error";
import type { ColSpans } from "@/helpers/grid";
import { useSaveLicense } from "@/hooks/api/gestao/customers/useSaveLicense";
import type { LicenseInput, LicenseStatus } from "@/types/contract";
import { calendarDay } from "@/utils/date";

type Field = keyof LicenseInput;
type Errors = Partial<Record<Field | "form", string>>;

type CustomerLicenseFormProps = {
  customerId: string;
  /** What is on file today (blank when never informed). */
  current: Pick<LicenseStatus, "number" | "issuedAt" | "validUntil">;
  submitLabel: string;
  onSaved: (license: LicenseStatus) => void;
  /** A "Cancelar" next to the submit (e.g. the dialog's close). */
  cancel?: ReactNode;
  /** Narrow container (a dialog): number on its own line, dates side by side. */
  stacked?: boolean;
};

/**
 * The customer's CNH (number, issue and validity), saved on the customer.
 * Same form in the contract flow ("Salvar CNH e continuar") and on the
 * customer page.
 */
export function CustomerLicenseForm({
  customerId,
  current,
  submitLabel,
  onSaved,
  cancel,
  stacked = false,
}: CustomerLicenseFormProps) {
  const save = useSaveLicense(customerId);
  const [driverLicense, setDriverLicense] = useState(current.number ?? "");
  const [issuedAt, setIssuedAt] = useState(
    current.issuedAt ? calendarDay(current.issuedAt) : "",
  );
  const [validUntil, setValidUntil] = useState(
    current.validUntil ? calendarDay(current.validUntil) : "",
  );
  const [errors, setErrors] = useState<Errors>({});
  const clearError = (field: Field) =>
    setErrors((current) => ({ ...current, [field]: undefined }));
  const dateSpan: ColSpans = stacked ? { span: 6 } : { sm: 4 };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!driverLicense.trim()) next.driverLicense = "Informe o número da CNH";
    if (!issuedAt) next.issuedAt = "Informe a data de emissão da CNH";
    if (!validUntil) next.validUntil = "Informe a validade da CNH";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    save.mutate(
      { driverLicense: driverLicense.trim(), issuedAt, validUntil },
      {
        onSuccess: onSaved,
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const known = Boolean(
            fields.driverLicense || fields.issuedAt || fields.validUntil,
          );
          setErrors({
            driverLicense: fields.driverLicense,
            issuedAt: fields.issuedAt,
            validUntil: fields.validUntil,
            form: known ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Form onSubmit={onSubmit} noValidate className="space-y-4">
      <Row className="gap-y-4">
        <Col sm={stacked ? 12 : 4}>
          <FormField
            label="Número da CNH"
            inputMode="numeric"
            value={driverLicense}
            onChange={(event) => {
              setDriverLicense(event.target.value);
              clearError("driverLicense");
            }}
            error={errors.driverLicense}
            disabled={save.isPending}
          />
        </Col>
        <Col {...dateSpan}>
          <DateField
            label="Emissão"
            value={issuedAt}
            onChange={(value) => {
              setIssuedAt(value);
              clearError("issuedAt");
            }}
            error={errors.issuedAt}
          />
        </Col>
        <Col {...dateSpan}>
          <DateField
            label="Validade"
            value={validUntil}
            onChange={(value) => {
              setValidUntil(value);
              clearError("validUntil");
            }}
            error={errors.validUntil}
          />
        </Col>
      </Row>
      {errors.form && <Alert>{errors.form}</Alert>}
      <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {cancel}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Spinner className="text-primary-foreground" />}
          {submitLabel}
        </Button>
      </Box>
    </Form>
  );
}
