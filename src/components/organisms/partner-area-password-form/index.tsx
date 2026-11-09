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
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { PasswordField } from "@/components/molecules/password-field";
import { PARTNER_PASSWORD_MIN_LENGTH } from "@/constants/partner-area";
import { toApiError } from "@/helpers/api-error";
import { useChangePartnerPassword } from "@/hooks/api/parceiro/account/useChangePartnerPassword";

type Errors = {
  currentPassword?: string;
  newPassword?: string;
  confirm?: string;
  form?: string;
};

/**
 * The partner's password. The API ends every session on a change, so
 * `onChanged` sends the partner to log in again with the new one.
 */
export function PartnerAreaPasswordForm({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const change = useChangePartnerPassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!currentPassword) next.currentPassword = "Informe a senha atual";
    if (newPassword.length < PARTNER_PASSWORD_MIN_LENGTH) {
      next.newPassword = `A nova senha precisa de pelo menos ${PARTNER_PASSWORD_MIN_LENGTH} caracteres`;
    } else if (newPassword !== confirm) {
      next.confirm = "As senhas não conferem";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: onChanged,
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          const newPasswordError = fields.newPassword ?? fields.password;
          setErrors({
            currentPassword: fields.currentPassword,
            newPassword: newPasswordError,
            form:
              fields.currentPassword || newPasswordError
                ? undefined
                : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Trocar senha</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <PasswordField
            label="Senha atual"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            error={errors.currentPassword}
            disabled={change.isPending}
          />
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            error={errors.newPassword}
            disabled={change.isPending}
          />
          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={errors.confirm}
            disabled={change.isPending}
          />
          <Text size="xs" tone="muted">
            Pelo menos {PARTNER_PASSWORD_MIN_LENGTH} caracteres. Depois de
            trocar, você entra de novo com a nova senha (em todos os
            aparelhos).
          </Text>
          {errors.form && <Alert>{errors.form}</Alert>}
          <Box className="flex justify-end">
            <Button
              type="submit"
              disabled={change.isPending}
              className="w-full sm:w-auto"
            >
              {change.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Trocar senha
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}
