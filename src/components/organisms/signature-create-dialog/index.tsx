import { Plus } from "lucide-react";
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
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { routeTo } from "@/constants/routes";
import { toApiError } from "@/helpers/api-error";
import { useCreateSignature } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import { usePdfDocumentOptions } from "@/hooks/ui/usePdfDocumentOptions";

type Errors = { documentId?: string; name?: string; form?: string };

/**
 * Makes an attached PDF signable: creates the request as a DRAFT and takes
 * the operator to configure it. Nothing goes to the provider here — only
 * "Solicitar assinatura(s)", inside.
 */
export function SignatureCreateDialog() {
  const create = useCreateSignature();
  const pdfs = usePdfDocumentOptions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [documentLabel, setDocumentLabel] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setDocumentId("");
    setDocumentLabel("");
    setName("");
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!documentId) next.documentId = "Escolha o PDF a assinar";
    if (!name.trim()) next.name = "Informe o nome do documento";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    create.mutate(
      { documentId, name: name.trim() },
      {
        onSuccess: (signature) => {
          setOpen(false);
          navigate(routeTo.signature(signature.id));
        },
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            documentId: fields.documentId,
            name: fields.name,
            form:
              fields.documentId || fields.name ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova assinatura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Nova assinatura</DialogTitle>
        <DialogDescription>
          Escolha um PDF já anexado. O pedido nasce como rascunho: nada vai ao
          Clicksign até você solicitar as assinaturas.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <RemoteCombobox
            label="PDF a assinar"
            value={documentId}
            selectedLabel={documentLabel}
            options={pdfs.options}
            isLoading={pdfs.isLoading}
            search={pdfs.search}
            onSearchChange={pdfs.setSearch}
            onChange={(option) => {
              setDocumentId(option.value);
              setDocumentLabel(option.label);
              if (!name.trim()) setName(option.label.replace(/\.pdf$/i, ""));
              setErrors({});
            }}
            placeholder="Buscar pelo nome do arquivo ou do dono"
            searchPlaceholder="Digite ao menos 2 letras"
            error={errors.documentId}
          />
          <FormField
            label="Nome do documento"
            placeholder="Como o signatário verá o documento"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
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
              Criar rascunho
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
