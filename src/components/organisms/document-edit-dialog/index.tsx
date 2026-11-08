import type { QueryKey } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
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
import { SelectField } from "@/components/molecules/select-field";
import { toApiError } from "@/helpers/api-error";
import { useDocumentCategories } from "@/hooks/api/gestao/documents/useDocumentCategories";
import { useDocumentMutations } from "@/hooks/api/gestao/documents/useDocumentMutations";
import type { DocumentAttachment, DocumentOwner } from "@/types/document";

const NO_CATEGORY = "none";

type DocumentEditDialogProps = {
  document: DocumentAttachment;
  owner: DocumentOwner;
  invalidate: QueryKey;
};

/** Rename a document or change its kind (the file itself stays). */
export function DocumentEditDialog({
  document,
  owner,
  invalidate,
}: DocumentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState(document.fileName);
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [errors, setErrors] = useState<{ filename?: string; form?: string }>(
    {},
  );
  const categories = useDocumentCategories(owner.type, open);
  const { update } = useDocumentMutations(owner, invalidate);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setFilename(document.fileName);
    setCategoryId(document.category?.id ?? NO_CATEGORY);
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = filename.trim();
    if (!name) {
      setErrors({ filename: "Informe o nome do arquivo" });
      return;
    }
    update.mutate(
      {
        id: document.id,
        input: {
          filename: name,
          categoryId: categoryId === NO_CATEGORY ? null : categoryId,
        },
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({
            filename: apiError.fields?.filename,
            form: apiError.fields?.filename ? undefined : apiError.message,
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
          aria-label={`Editar ${document.fileName}`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Editar documento</DialogTitle>
        <DialogDescription>
          Muda o nome e o tipo; o arquivo continua o mesmo.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Nome do arquivo"
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            error={errors.filename}
            disabled={update.isPending}
          />
          <SelectField
            label="Tipo"
            value={categoryId}
            onChange={setCategoryId}
            options={[
              { value: NO_CATEGORY, label: "Sem tipo" },
              ...(categories.data ?? []).map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            disabled={update.isPending || categories.isPending}
          />
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={update.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
