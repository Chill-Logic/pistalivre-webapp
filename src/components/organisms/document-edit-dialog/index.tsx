import type { QueryKey } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
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
import { Text } from "@/components/atoms/text";
import { FilePicker } from "@/components/molecules/file-picker";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { toApiError } from "@/helpers/api-error";
import { isUnderSignature } from "@/helpers/signature";
import { useDocumentCategories } from "@/hooks/api/gestao/documents/useDocumentCategories";
import { useDocumentMutations } from "@/hooks/api/gestao/documents/useDocumentMutations";
import type { DocumentAttachment, DocumentOwner } from "@/types/document";

const NO_CATEGORY = "none";

type Errors = { filename?: string; file?: string; form?: string };

type DocumentEditDialogProps = {
  document: DocumentAttachment;
  owner: DocumentOwner;
  invalidate: QueryKey;
  /** Shorter dialog: just the name (e.g. renaming from the search). */
  renameOnly?: boolean;
};

/**
 * Rename a document, change its kind or replace the file. A PDF under
 * signature keeps its file (otherwise it's no longer what was signed).
 */
export function DocumentEditDialog({
  document,
  owner,
  invalidate,
  renameOnly = false,
}: DocumentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState(document.fileName);
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const categories = useDocumentCategories(owner.type, open && !renameOnly);
  const { update } = useDocumentMutations(owner, invalidate);
  const locked = isUnderSignature(document);

  const onOpenChange = (next: boolean) => {
    if (update.isPending) return;
    setOpen(next);
    if (!next) return;
    setFilename(document.fileName);
    setCategoryId(document.category?.id ?? NO_CATEGORY);
    setFiles([]);
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
        input: renameOnly
          ? { filename: name }
          : {
              filename: name,
              categoryId: categoryId === NO_CATEGORY ? null : categoryId,
              file: files[0],
            },
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            filename: fields.filename,
            file: fields.file,
            form: fields.filename || fields.file ? undefined : apiError.message,
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
          aria-label={`${renameOnly ? "Renomear" : "Editar"} ${document.fileName}`}
          title={renameOnly ? "Renomear" : "Editar"}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {renameOnly ? "Renomear documento" : "Editar documento"}
        </DialogTitle>
        <DialogDescription>
          {renameOnly
            ? "Muda só o nome; o arquivo continua o mesmo."
            : "Altere o nome, o tipo ou substitua o arquivo."}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Nome do arquivo"
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            error={errors.filename}
            disabled={update.isPending}
          />
          {!renameOnly && (
            <>
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
              {locked ? (
                <Alert variant="info" role="note">
                  Documento em assinatura: o arquivo não pode ser substituído,
                  senão deixa de ser o que o signatário assinou. Nome e tipo
                  seguem editáveis.
                </Alert>
              ) : (
                <Box className="space-y-1.5">
                  <Text size="sm" weight="medium">
                    Substituir arquivo (opcional)
                  </Text>
                  <FilePicker
                    files={files}
                    onChange={setFiles}
                    multiple={false}
                    label={files.length ? "Escolher outro" : "Escolher arquivo"}
                    disabled={update.isPending}
                  />
                  {errors.file && (
                    <Text size="xs" tone="destructive">
                      {errors.file}
                    </Text>
                  )}
                </Box>
              )}
            </>
          )}
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
