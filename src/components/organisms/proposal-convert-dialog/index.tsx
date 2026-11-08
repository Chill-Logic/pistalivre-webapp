import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { MaskedField } from "@/components/molecules/masked-field";
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { useConvertProposal } from "@/hooks/api/gestao/proposals/useProposalMutations";
import type { ProposalDetail } from "@/types/proposal";
import { maskPhone, onlyDigits } from "@/utils/masks";

type Errors = { name?: string; phone?: string; email?: string; form?: string };

/**
 * A standalone proposal ("avulsa") becomes a CRM lead: the recipient's
 * contact comes filled in, and the proposal moves to the lead.
 */
export function ProposalConvertDialog({
  proposal,
}: {
  proposal: ProposalDetail;
}) {
  const convert = useConvertProposal(proposal.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (convert.isPending) return;
    setOpen(next);
    if (!next) return;
    setName(proposal.recipient.name);
    setPhone(maskPhone(proposal.recipient.phone ?? ""));
    setEmail(proposal.recipient.email ?? "");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Informe o nome";
    if (onlyDigits(phone).length < 10)
      next.phone = "Informe um telefone válido com DDD";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    convert.mutate(
      {
        name: name.trim(),
        phone: onlyDigits(phone),
        ...(email.trim() ? { email: email.trim() } : {}),
      },
      {
        onSuccess: (leadId) => {
          setOpen(false);
          navigate(routeTo.lead(leadId));
        },
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            name: fields.name,
            phone: fields.phone,
            email: fields.email,
            form:
              fields.name || fields.phone || fields.email
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
        <Button variant="outline" size="sm">
          <UserPlus />
          Converter em lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Converter em lead</DialogTitle>
        <DialogDescription>
          Cria um lead no CRM com o contato desta proposta, que passa a ficar na
          trilha dele.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
          />
          <MaskedField
            label="Telefone"
            inputMode="tel"
            placeholder="(11) 91234-5678"
            value={phone}
            onChange={setPhone}
            mask={maskPhone}
            error={errors.phone}
          />
          <FormField
            label="E-mail (opcional)"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={convert.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={convert.isPending}>
              {convert.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Criar lead
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
