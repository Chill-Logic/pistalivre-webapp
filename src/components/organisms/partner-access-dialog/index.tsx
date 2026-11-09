import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
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
import { usePartnerAccess } from "@/hooks/api/gestao/partners/usePartnerMutations";

type Errors = { password?: string; confirm?: string; form?: string };

type PartnerAccessDialogProps = {
  partnerId: string;
  email: string;
  /** Already has a password: this resets it. */
  hasAccess: boolean;
  trigger: ReactNode;
};

/**
 * Gives (or resets) the password of the partner area. The login is the
 * partner's e-mail; any open session of theirs ends.
 */
export function PartnerAccessDialog({
  partnerId,
  email,
  hasAccess,
  trigger,
}: PartnerAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { grant } = usePartnerAccess(partnerId);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setPassword("");
    setConfirm("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (password.length < 8) {
      next.password = "A senha precisa de pelo menos 8 caracteres";
    } else if (password !== confirm) {
      next.confirm = "As senhas não conferem";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    grant.mutate(password, {
      onSuccess: () => {
        toast.success(hasAccess ? "Senha redefinida" : "Acesso liberado");
        setOpen(false);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        setErrors({
          password: apiError.fields?.password,
          form: apiError.fields?.password ? undefined : apiError.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{hasAccess ? "Redefinir senha" : "Dar acesso"}</DialogTitle>
        <DialogDescription>
          O parceiro entra com o e-mail {email} e esta senha. Passe a senha a
          ele por um canal seguro.
          {hasAccess && " Quem estiver conectado com a senha antiga sai."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            disabled={grant.isPending}
          />
          <FormField
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={errors.confirm}
            disabled={grant.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={grant.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={grant.isPending}>
              {grant.isPending && <Spinner className="text-primary-foreground" />}
              {hasAccess ? "Redefinir senha" : "Dar acesso"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
