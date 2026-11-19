import { useState, type ReactNode } from "react";
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
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useNoteWrites } from "@/hooks/api/gestao/notes/useNotes";
import type { Note, NoteOwner } from "@/types/note";

type NoteDialogProps = {
  owner: NoteOwner;
  /** Editing this note (its files are managed on the card); absent = new. */
  note?: Note;
  trigger: ReactNode;
};

/**
 * Write or edit a staff note: optional title, the text and, on a new note,
 * files (click, drag or Ctrl+V). Needs at least one of the three.
 */
export function NoteDialog({ owner, note, trigger }: NoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const { create, update } = useNoteWrites(owner);
  const mutation = note ? update : create;
  const apiError = mutation.error ? toApiError(mutation.error) : null;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setTitle(note?.title ?? "");
      setBody(note?.body ?? "");
      setFiles([]);
      setLocalError(null);
      mutation.reset();
    }
  };

  const submit = () => {
    const input = { title: title.trim(), body };
    const hasFiles = note ? note.documents.length > 0 : files.length > 0;
    if (!input.title && !body.trim() && !hasFiles) {
      setLocalError("Escreva algo ou anexe um arquivo");
      return;
    }
    setLocalError(null);
    const done = { onSuccess: () => setOpen(false) };
    if (note) update.mutate({ id: note.id, input }, done);
    else create.mutate({ input, files }, done);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="lg">
        <Box className="space-y-1">
          <DialogTitle>{note ? "Editar nota" : "Nova nota"}</DialogTitle>
          <DialogDescription>
            Só a equipe vê. O cliente não vê as notas.
          </DialogDescription>
        </Box>
        <Form
          id="note-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <FormField
            label="Título (opcional)"
            value={title}
            maxLength={160}
            onChange={(event) => setTitle(event.target.value)}
            error={apiError?.fields?.title}
          />
          <TextareaField
            label="Nota"
            value={body}
            rows={6}
            onChange={(event) => setBody(event.target.value)}
            error={localError ?? apiError?.fields?.body}
          />
          {!note && (
            <FilePicker
              files={files}
              onChange={setFiles}
              disabled={mutation.isPending}
            />
          )}
          {apiError && !apiError.fields && (
            <Text tone="destructive">{apiError.message}</Text>
          )}
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="note-form" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Spinner className="text-primary-foreground" />
            )}
            {note ? "Salvar" : "Salvar nota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
