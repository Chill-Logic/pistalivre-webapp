import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { toApiError } from "@/helpers/api-error";
import { useCardFees, useSaveCardFees } from "@/hooks/api/gestao/card-fees/useCardFees";
import type { CardFeeBand } from "@/types/card-fees";
import { formatCurrency } from "@/utils/format";

/** A band as typed (strings, so a half-typed "3," doesn't jump). */
type Draft = { from: string; to: string; percent: string; fixed: string };

const toDraft = (b: CardFeeBand): Draft => ({
  from: String(b.from),
  to: String(b.to),
  percent: String(b.percent).replace(".", ","),
  fixed: String(b.fixedPerInstallment).replace(".", ","),
});
const num = (v: string) => Number(v.replace(",", "."));
const toBand = (d: Draft): CardFeeBand => ({
  from: num(d.from),
  to: num(d.to),
  percent: num(d.percent),
  fixedPerInstallment: num(d.fixed),
});

function CardFeeSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Configurações › Juros do cartão: what the payment link adds when the
 * customer pays the balance in installments (gross-up: the net is the
 * balance). Bands of installments, contiguous from 1×; the last one is the
 * maximum offered. The example comes computed from the server.
 */
export function CardFeeSettingsPage() {
  const settings = useCardFees();
  const save = useSaveCardFees();
  const [rows, setRows] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data) setRows(settings.data.bands.map(toDraft));
  }, [settings.data]);

  const update = (index: number, patch: Partial<Draft>) => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setError(null);
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    const from = last ? num(last.to) + 1 : 1;
    setRows([...rows, { from: String(from), to: String(from), percent: "0", fixed: "0" }]);
  };

  const onSave = (bands: CardFeeBand[] | null) =>
    save.mutate(bands, { onError: (err) => setError(toApiError(err).message) });

  const data = settings.data;

  return (
    <Box className="space-y-6">
      <PageHeader title="Juros do cartão" />
      {settings.isPending && (
        <SkeletonRegion label="Carregando…">
          <CardFeeSkeleton />
        </SkeletonRegion>
      )}
      {settings.isError && <QueryError error={settings.error} onRetry={() => settings.refetch()} />}
      {data && (
        <Row className="items-start gap-y-6">
          <Col lg={7}>
            <Card>
              <CardHeader>
                <Box className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Faixas de parcelas</CardTitle>
                  {data.isDefault && <Badge variant="outline">Taxas padrão</Badge>}
                </Box>
              </CardHeader>
              <CardContent className="space-y-4">
                <Text size="sm" tone="muted">
                  O link de pagamento cobra no cartão o saldo mais o percentual e a taxa por parcela
                  da faixa. As faixas começam em 1× e se emendam; a última define o máximo de
                  parcelas (até 21×).
                </Text>
                {rows.map((row, index) => (
                  <Row key={index} className="items-end gap-y-3 rounded-lg border p-3">
                    <Col span={6} md={2}>
                      <FormField
                        label="De"
                        inputMode="numeric"
                        value={row.from}
                        onChange={(e) => update(index, { from: e.target.value })}
                      />
                    </Col>
                    <Col span={6} md={2}>
                      <FormField
                        label="Até"
                        inputMode="numeric"
                        value={row.to}
                        onChange={(e) => update(index, { to: e.target.value })}
                      />
                    </Col>
                    <Col span={6} md={3}>
                      <FormField
                        label="Percentual (%)"
                        inputMode="decimal"
                        value={row.percent}
                        onChange={(e) => update(index, { percent: e.target.value })}
                      />
                    </Col>
                    <Col span={6} md={4}>
                      <FormField
                        label="Por parcela (R$)"
                        inputMode="decimal"
                        value={row.fixed}
                        onChange={(e) => update(index, { fixed: e.target.value })}
                      />
                    </Col>
                    <Col md={1} className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Remover faixa ${index + 1}`}
                        disabled={rows.length === 1}
                        onClick={() => setRows(rows.filter((_, i) => i !== index))}
                      >
                        <Trash2 />
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus />
                  Adicionar faixa
                </Button>
                {error && <Alert>{error}</Alert>}
                <Box className="flex flex-wrap justify-end gap-2">
                  {!data.isDefault && (
                    <Button variant="ghost" disabled={save.isPending} onClick={() => onSave(null)}>
                      Voltar às taxas padrão
                    </Button>
                  )}
                  <Button disabled={save.isPending} onClick={() => onSave(rows.map(toBand))}>
                    {save.isPending && <Spinner className="text-primary-foreground" />}
                    Salvar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Col>
          <Col lg={5}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Exemplo: saldo de {formatCurrency(data.example.amount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Parcelas</TableHead>
                      <TableHead className="text-right">Parcela</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.example.options.map((o) => (
                      <TableRow key={o.installments}>
                        <TableCell>{o.installments}×</TableCell>
                        <TableCell className="text-right">{formatCurrency(o.perInstallment)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Text size="xs" tone="muted" className="mt-3">
                  Mostra a tabela salva. Salve para ver o efeito de uma mudança.
                </Text>
              </CardContent>
            </Card>
          </Col>
        </Row>
      )}
    </Box>
  );
}
