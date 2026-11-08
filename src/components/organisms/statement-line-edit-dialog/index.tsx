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
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { toApiError } from "@/helpers/api-error";
import { useAnnotateStatementLine } from "@/hooks/api/gestao/finance/useAnnotateStatementLine";
import type { StatementLine } from "@/types/statement";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

const NOTE_MAX = 500;

/**
 * Our description of a bank line and the "between our accounts" mark (it
 * leaves the totals the accountant sees). The bank's text is the proof and
 * stays as it is.
 */
export function StatementLineEditDialog({ line }: { line: StatementLine }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState<{ note?: string; form?: string }>({});
  const annotate = useAnnotateStatementLine();

  const onOpenChange = (next: boolean) => {
    if (annotate.isPending) return;
    setOpen(next);
    if (!next) return;
    setNote(line.note ?? line.suggestion ?? "");
    setInternal(line.internal);
    setError({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (trimmed.length > NOTE_MAX) {
      setError({ note: `No máximo ${NOTE_MAX} caracteres` });
      return;
    }
    annotate.mutate(
      {
        source: line.source,
        transactionKey: line.key,
        note: trimmed,
        internal,
        date: line.date,
        amount: line.amount,
        originalDescription: line.originalDescription,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => {
          const apiError = toApiError(err);
          setError(
            apiError.fields?.note
              ? { note: apiError.fields.note }
              : { form: apiError.message },
          );
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
          aria-label={`Editar lançamento de ${formatCalendarDate(line.date)}`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Editar lançamento</DialogTitle>
        <DialogDescription>
          {formatCalendarDate(line.date)} ·{" "}
          {formatCurrency(Math.abs(line.amount))}{" "}
          {line.amount >= 0 ? "entrada" : "saída"}
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Box className="rounded-md bg-muted px-3 py-2">
            <Text size="xs" tone="muted">
              Texto do banco (não muda)
            </Text>
            <Text size="sm" className="break-words">
              {line.originalDescription}
            </Text>
          </Box>
          <TextareaField
            label="Nossa descrição"
            placeholder="Ex.: aluguel da semana da LOC-123"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setError({});
            }}
            error={error.note}
            disabled={annotate.isPending}
          />
          {!line.note && line.suggestion && (
            <Text size="xs" tone="muted">
              Preenchido com a sugestão do pix que enviamos. Apague para não
              usar.
            </Text>
          )}
          <CheckboxField
            label="Transferência entre as nossas contas"
            hint={
              line.internalSuggested && !line.internal
                ? "Parece ser uma: sai dos totais e aparece à parte."
                : "Sai dos totais e aparece à parte."
            }
            checked={internal}
            onChange={setInternal}
            disabled={annotate.isPending}
          />
          {error.form && <Alert>{error.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={annotate.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={annotate.isPending}>
              {annotate.isPending && (
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
