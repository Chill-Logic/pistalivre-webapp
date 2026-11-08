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
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useUpdateSignatureSettings } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import type { SignatureDetail } from "@/types/signature";
import { calendarDay } from "@/utils/date";

/** How often the provider reminds whoever has not signed (management app). */
const REMIND_OPTIONS = [1, 2, 3, 7].map((days) => ({
  value: String(days),
  label: days === 1 ? "A cada 1 dia" : `A cada ${days} dias`,
}));

type Errors = Partial<
  Record<"name" | "deadlineAt" | "message" | "form", string>
>;

/**
 * The draft's settings: the name the signer sees, the deadline (the
 * provider allows up to 90 days), the reminder, closing by itself after the
 * last signature, and the invitation message. Only while it is a draft.
 */
export function SignatureSettingsForm({
  signature,
}: {
  signature: SignatureDetail;
}) {
  const save = useUpdateSignatureSettings(signature.id);
  const [name, setName] = useState(signature.name);
  const [deadlineAt, setDeadlineAt] = useState(
    signature.deadlineAt ? calendarDay(signature.deadlineAt) : "",
  );
  const [remindInterval, setRemindInterval] = useState(
    String(signature.remindInterval),
  );
  const [autoClose, setAutoClose] = useState(signature.autoClose);
  const [message, setMessage] = useState(signature.message ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Informe o nome do documento" });
      return;
    }
    setErrors({});
    save.mutate(
      {
        name: name.trim(),
        message: message.trim() || null,
        deadlineAt: deadlineAt || null,
        remindInterval: Number(remindInterval),
        autoClose,
      },
      {
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            name: fields.name,
            deadlineAt: fields.deadlineAt,
            message: fields.message,
            form: Object.keys(fields).length > 0 ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuração</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6}>
              <FormField
                label="Nome do documento"
                placeholder="Como o signatário verá o documento"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
              />
            </Col>
            <Col md={6}>
              <DateField
                label="Prazo para assinar (até 90 dias)"
                value={deadlineAt}
                onChange={setDeadlineAt}
                error={errors.deadlineAt}
                clearable
              />
            </Col>
            <Col md={6}>
              <SelectField
                label="Reenviar lembrete"
                value={remindInterval}
                options={REMIND_OPTIONS}
                onChange={setRemindInterval}
              />
            </Col>
            <Col md={6} className="flex items-end">
              <CheckboxField
                label="Finalizar sozinho após a última assinatura"
                checked={autoClose}
                onChange={setAutoClose}
              />
            </Col>
            <Col>
              <TextareaField
                label="Mensagem no convite (opcional)"
                placeholder="Texto que o signatário lê junto do convite"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                error={errors.message}
              />
            </Col>
          </Row>
          {errors.form && <Alert>{errors.form}</Alert>}
          <Box className="flex justify-end">
            <Button type="submit" variant="outline" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              Salvar configuração
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}
