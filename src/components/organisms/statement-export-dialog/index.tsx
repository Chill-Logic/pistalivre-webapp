import { FileSpreadsheet } from "lucide-react";
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
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateRangeField } from "@/components/molecules/date-range-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useCreateStatementExport } from "@/hooks/api/gestao/finance/useStatementExportMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StatementSource } from "@/types/statement";
import type { StatementExportFailure } from "@/types/statement-export";
import { todayInBrasilia } from "@/utils/date";

const SOURCES: StatementSource[] = ["ASAAS", "INTER"];

type Errors = { sources?: string; start?: string; end?: string; form?: string };

type StatementExportDialogProps = {
  /** The screen's filter: the dialog starts from it. */
  start: string;
  end: string;
  source: StatementSource | "ALL";
};

/**
 * "Exportar planilha": one .xlsx per account for the period, saved in the
 * history and downloaded right away. An account that is down is reported
 * without voiding the other.
 */
export function StatementExportDialog({
  start,
  end,
  source,
}: StatementExportDialogProps) {
  const create = useCreateStatementExport();
  const idempotency = useIdempotencyKey();
  const { label } = useLabels();
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<StatementSource[]>([]);
  const [range, setRange] = useState({ start, end });
  const [errors, setErrors] = useState<Errors>({});
  const [failures, setFailures] = useState<StatementExportFailure[]>([]);
  const [downloaded, setDownloaded] = useState(0);

  const onOpenChange = (next: boolean) => {
    if (create.isPending) return;
    setOpen(next);
    if (!next) return;
    setSources(source === "ALL" ? SOURCES : [source]);
    setRange({ start, end });
    setErrors({});
    setFailures([]);
  };

  const toggle = (value: StatementSource, checked: boolean) => {
    setSources((current) =>
      SOURCES.filter((item) =>
        item === value ? checked : current.includes(item),
      ),
    );
    setErrors({});
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (sources.length === 0) {
      setErrors({ sources: "Escolha ao menos uma conta" });
      return;
    }
    setErrors({});
    setFailures([]);
    create.mutate(
      { key: idempotency.key, input: { sources, ...range } },
      {
        onSuccess: (result) => {
          idempotency.renew();
          if (result.failures.length === 0) {
            setOpen(false);
            return;
          }
          // Retrying only the failed accounts: the others are already saved.
          setFailures(result.failures);
          setDownloaded(result.files.length);
          setSources(result.failures.map((failure) => failure.source));
        },
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            ...fields,
            form: Object.keys(fields).length > 0 ? undefined : apiError.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileSpreadsheet />
          Exportar planilha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Exportar planilha</DialogTitle>
        <DialogDescription>
          Uma planilha por conta, com as nossas descrições ao lado das do
          banco. Fica guardada em “Exportações”.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Box className="space-y-3">
            <Text weight="medium">Contas</Text>
            {SOURCES.map((value) => (
              <CheckboxField
                key={value}
                label={label(LABEL_MAPS.statementSource, value)}
                checked={sources.includes(value)}
                onChange={(checked) => toggle(value, checked)}
                disabled={create.isPending}
              />
            ))}
            {errors.sources && (
              <Text size="xs" tone="destructive">
                {errors.sources}
              </Text>
            )}
          </Box>
          <DateRangeField
            label="Período"
            start={range.start}
            end={range.end}
            max={todayInBrasilia()}
            onChange={(next) => {
              setRange(next);
              setErrors({});
            }}
          />
          {(errors.start || errors.end) && (
            <Text size="xs" tone="destructive">
              {errors.start ?? errors.end}
            </Text>
          )}
          {failures.length > 0 && (
            <Alert variant="warning" className="space-y-1">
              <Text size={null} weight="medium">
                {downloaded > 0
                  ? "As outras foram baixadas, mas não deu para exportar:"
                  : "Nenhuma planilha saiu:"}
              </Text>
              <List className="space-y-1">
                {failures.map((failure) => (
                  <ListItem key={failure.source}>
                    {failure.label}: {failure.message}
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
              >
                {failures.length > 0 ? "Fechar" : "Cancelar"}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {create.isPending
                ? "Gerando…"
                : failures.length > 0
                  ? "Tentar de novo"
                  : "Exportar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
