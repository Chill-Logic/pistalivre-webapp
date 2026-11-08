import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { FormField } from "@/components/molecules/form-field";
import { toApiError } from "@/helpers/api-error";
import { useChangeMyPassword } from "@/hooks/api/cliente/account/useChangeMyPassword";

const MIN_LENGTH = 6;

type Errors = {
  currentPassword?: string;
  newPassword?: string;
  confirm?: string;
  form?: string;
};

/** The renter's password; on the first access the current one is the CPF. */
export function PortalPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const change = useChangeMyPassword();

  const onOpenChange = (next: boolean) => {
    if (change.isPending) return;
    setOpen(next);
    if (!next) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!currentPassword) next.currentPassword = "Informe a senha atual";
    if (newPassword.length < MIN_LENGTH) {
      next.newPassword = `A nova senha precisa de pelo menos ${MIN_LENGTH} caracteres`;
    } else if (newPassword !== confirm) {
      next.confirm = "As senhas não conferem";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            currentPassword: fields.currentPassword,
            newPassword: fields.newPassword,
            form:
              fields.currentPassword || fields.newPassword
                ? undefined
                : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Trocar senha"
          title="Trocar senha"
        >
          <KeyRound />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Trocar senha</DialogTitle>
        <DialogDescription>
          No primeiro acesso a senha é o seu CPF. Escolha uma senha sua.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            error={errors.currentPassword}
            disabled={change.isPending}
          />
          <FormField
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            error={errors.newPassword}
            disabled={change.isPending}
          />
          <FormField
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={errors.confirm}
            disabled={change.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={change.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={change.isPending}>
              {change.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Trocar senha
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
