import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Signature } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { signatureNameFrom } from "@/helpers/signature";
import { useCreateSignature } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import type { DocumentFile } from "@/types/document";

type DocumentSignableDialogProps = {
  document: DocumentFile;
  /** The query that lists the document (its signature badge shows up). */
  invalidate: QueryKey;
};

/**
 * "Tornar assinável": creates the signature request as a DRAFT for this PDF
 * and offers to open it. Nothing goes to Clicksign here — only "Solicitar
 * assinatura(s)", inside the request.
 */
export function DocumentSignableDialog({
  document,
  invalidate,
}: DocumentSignableDialogProps) {
  const queryClient = useQueryClient();
  const create = useCreateSignature();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string; form?: string }>({});
  const [createdId, setCreatedId] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setName(signatureNameFrom(document.fileName));
    setErrors({});
    setCreatedId(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Informe o nome do documento" });
      return;
    }
    create.mutate(
      { documentId: document.id, name: name.trim() },
      {
        onSuccess: (signature) => {
          queryClient.invalidateQueries({ queryKey: invalidate });
          setCreatedId(signature.id);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            name: apiError.fields?.name,
            form: apiError.fields?.name ? undefined : apiError.message,
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
          aria-label={`Tornar assinável ${document.fileName}`}
          title="Tornar assinável"
        >
          <Signature />
        </Button>
      </DialogTrigger>
      <DialogContent>
        {createdId ? (
          <>
            <DialogTitle>Pedido de assinatura criado</DialogTitle>
            <DialogDescription>
              O rascunho está pronto. Abra o pedido para escolher os signatários
              e solicitar as assinaturas.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Agora não</Button>
              </DialogClose>
              <Button asChild>
                <Link to={routeTo.signature(createdId)}>Abrir pedido</Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogTitle>Tornar assinável</DialogTitle>
            <DialogDescription>
              Cria um pedido de assinatura em rascunho para este PDF. Nada vai
              ao Clicksign até você solicitar as assinaturas.
            </DialogDescription>
            <Form onSubmit={onSubmit} noValidate className="space-y-4">
              <FormField
                label="Nome do documento"
                placeholder="Como o signatário verá o documento"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
                disabled={create.isPending}
              />
              {errors.form && <Alert>{errors.form}</Alert>}
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={create.isPending}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending && (
                    <Spinner className="text-primary-foreground" />
                  )}
                  Criar pedido
                </Button>
              </DialogFooter>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
