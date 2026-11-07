import { Pencil } from "lucide-react";
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
import { TextareaField } from "@/components/molecules/textarea-field";
import { errorMessage } from "@/helpers/api-error";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";

type LeadNotesCardProps = { leadId: string; notes: string | null };

/** Free notes on the lead; editable even after it closes (it's context). */
export function LeadNotesCard({ leadId, notes }: LeadNotesCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { notes: save } = useLeadActions(leadId);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setValue(notes ?? "");
    setError(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    save.mutate(value.trim(), {
      onSuccess: () => setOpen(false),
      onError: (err) => setError(errorMessage(err)),
    });
  };

  return (
    <Card>
      <CardHeader>
        <Box className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Observações</CardTitle>
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Pencil />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Observações</DialogTitle>
              <DialogDescription>
                Deixe em branco para apagar.
              </DialogDescription>
              <Form onSubmit={onSubmit} noValidate className="space-y-4">
                <TextareaField
                  label="Observações"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  disabled={save.isPending}
                />
                {error && <Alert>{error}</Alert>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={save.isPending}
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={save.isPending}>
                    {save.isPending && (
                      <Spinner className="text-primary-foreground" />
                    )}
                    Salvar
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </Box>
      </CardHeader>
      <CardContent>
        {notes ? (
          <Text className="whitespace-pre-line break-words">{notes}</Text>
        ) : (
          <Text tone="muted">Nenhuma observação.</Text>
        )}
      </CardContent>
    </Card>
  );
}
