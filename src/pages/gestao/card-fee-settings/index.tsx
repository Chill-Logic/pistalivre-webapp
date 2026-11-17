import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
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
import { MoneyField } from "@/components/molecules/money-field";
import { PageHeader } from "@/components/molecules/page-header";
import { SwitchField } from "@/components/molecules/switch-field";
import { PercentField } from "@/components/molecules/percent-field";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { toApiError } from "@/helpers/api-error";
import { feeBandsSummary } from "@/helpers/card-fees";
import {
  useCardFees,
  useCardFeesPreview,
  useSaveCardFees,
} from "@/hooks/api/gestao/card-fees/useCardFees";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import type { CardAnticipation, CardFeeBand } from "@/types/card-fees";
import { cn } from "@/utils/cn";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** A band as typed: installments as text (digits only), money/percent as numbers. */
type Draft = {
  from: string;
  to: string;
  percent: number | null;
  fixed: number | null;
};

const toDraft = (b: CardFeeBand): Draft => ({
  from: String(b.from),
  to: String(b.to),
  percent: b.percent,
  fixed: b.fixedPerInstallment,
});
const toBand = (d: Draft): CardFeeBand => ({
  from: Number(d.from),
  to: Number(d.to),
  percent: d.percent ?? 0,
  fixedPerInstallment: d.fixed ?? 0,
});
const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 2);
const DEFAULT_EXAMPLE = 1000;

function CardFeeSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 pt-4 md:pt-5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Configurações › Juros do cartão: what the payment link adds when the
 * customer pays by card (gross-up: the net is the amount). Bands of
 * installments, contiguous from 1×; the last one is the maximum offered. The
 * example follows what is TYPED (computed by the server, not saved) and its
 * amount is editable.
 */
export function CardFeeSettingsPage() {
  const settings = useCardFees();
  const save = useSaveCardFees();
  const [rows, setRows] = useState<Draft[]>([]);
  const [anticipation, setAnticipation] = useState<{
    single: number | null;
    installments: number | null;
  }>({ single: 0, installments: 0 });
  /** Example only: pass the anticipation on (a new charge does not, by default). */
  const [passAnticipation, setPassAnticipation] = useState(false);
  const [exampleAmount, setExampleAmount] = useState<number | null>(
    DEFAULT_EXAMPLE,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.data) return;
    setRows(settings.data.bands.map(toDraft));
    setAnticipation(settings.data.anticipation);
  }, [settings.data]);

  const typedAnticipation: CardAnticipation = {
    single: anticipation.single ?? 0,
    installments: anticipation.installments ?? 0,
  };
  const draft = useMemo(
    () =>
      rows.length && exampleAmount && exampleAmount > 0
        ? {
            bands: rows.map(toBand),
            anticipation: typedAnticipation,
            amount: exampleAmount,
            passAnticipation,
          }
        : null,
    // typedAnticipation is derived from `anticipation`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, anticipation, exampleAmount, passAnticipation],
  );
  const preview = useCardFeesPreview(useDebouncedValue(draft, 400));

  const update = (index: number, patch: Partial<Draft>) => {
    setRows((current) =>
      current.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
    setError(null);
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    const from = last ? Number(last.to) + 1 : 1;
    setRows([
      ...rows,
      { from: String(from), to: String(from), percent: 0, fixed: 0 },
    ]);
  };

  const onSave = (bands: CardFeeBand[] | null) =>
    save.mutate(
      { bands, anticipation: typedAnticipation },
      { onError: (err) => setError(toApiError(err).message) },
    );

  const data = settings.data;
  const options = preview.data?.options ?? data?.example.options ?? [];
  const shownAmount =
    preview.data?.amount ?? data?.example.amount ?? DEFAULT_EXAMPLE;
  const hasReceived = options.some((o) => o.received != null);

  /** "Usar as taxas do Asaas": fills the bands and the anticipation (not saved yet). */
  const applyProviderFees = (bands: CardFeeBand[]) => {
    if (!data?.asaas) return;
    setRows(bands.map(toDraft));
    setAnticipation(data.asaas.anticipation);
    setError(null);
  };

  return (
    <Box className="space-y-6">
      <PageHeader title="Juros do cartão" />
      {settings.isPending && (
        <SkeletonRegion label="Carregando…">
          <CardFeeSkeleton />
        </SkeletonRegion>
      )}
      {settings.isError && (
        <QueryError error={settings.error} onRetry={() => settings.refetch()} />
      )}
      {data && (
        <Row className="items-start gap-y-6">
          <Col lg={6}>
            <Card>
              <CardHeader>
                <Box className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Faixas de parcelas
                  </CardTitle>
                  {data.isDefault && (
                    <Badge variant="outline">Taxas padrão</Badge>
                  )}
                </Box>
              </CardHeader>
              <CardContent className="space-y-4">
                <Text size="sm" tone="muted">
                  O link de pagamento cobra no cartão o valor mais o percentual
                  e a taxa por parcela da faixa. As faixas começam em 1× e se
                  emendam; a última define o máximo de parcelas (até 21×).
                </Text>
                {data.asaas ? (
                  <Box className="space-y-2 rounded-lg border bg-muted/40 p-3">
                    <Text size="sm" weight="medium">
                      Taxas da conta no Asaas
                    </Text>
                    <Text size="sm" tone="muted">
                      {feeBandsSummary(data.asaas.bands)}. Antecipação:{" "}
                      {data.asaas.anticipation.single.toLocaleString("pt-BR")}%
                      (à vista) e{" "}
                      {data.asaas.anticipation.installments.toLocaleString(
                        "pt-BR",
                      )}
                      % (parcelado) ao mês.
                    </Text>
                    {data.asaas.promoUntil && (
                      <Text size="sm" tone="muted">
                        Promoção até {formatCalendarDate(data.asaas.promoUntil)}
                        . Depois: {feeBandsSummary(data.asaas.regularBands)}.
                      </Text>
                    )}
                    <Box className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyProviderFees(data.asaas!.bands)}
                      >
                        Usar as taxas do Asaas
                      </Button>
                      {data.asaas.promoUntil && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            applyProviderFees(data.asaas!.regularBands)
                          }
                        >
                          Usar as de depois da promoção
                        </Button>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Text size="xs" tone="muted">
                    Não deu para ler as taxas do Asaas agora.
                  </Text>
                )}
                {rows.map((row, index) => (
                  <Row
                    key={index}
                    className="items-end gap-y-3 rounded-lg border p-3"
                  >
                    {row.from === "1" && row.to === "1" ? (
                      // Only 1×: it reads "À vista", not "de 1 até 1".
                      <Col md={4} className="self-center">
                        <Text weight="medium">À vista</Text>
                        <Text size="xs" tone="muted">
                          1× no cartão
                        </Text>
                      </Col>
                    ) : (
                      <>
                        <Col span={6} md={2}>
                          <FormField
                            label="De"
                            inputMode="numeric"
                            value={row.from}
                            onChange={(e) =>
                              update(index, {
                                from: onlyDigits(e.target.value),
                              })
                            }
                          />
                        </Col>
                        <Col span={6} md={2}>
                          <FormField
                            label="Até"
                            inputMode="numeric"
                            value={row.to}
                            onChange={(e) =>
                              update(index, { to: onlyDigits(e.target.value) })
                            }
                          />
                        </Col>
                      </>
                    )}
                    <Col span={6} md={3}>
                      <PercentField
                        label="Percentual"
                        value={row.percent}
                        onChange={(percent) => update(index, { percent })}
                      />
                    </Col>
                    <Col span={6} md={4}>
                      <MoneyField
                        label="Por parcela"
                        value={row.fixed}
                        onChange={(fixed) => update(index, { fixed })}
                      />
                    </Col>
                    <Col md={1} className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Remover faixa ${index + 1}`}
                        disabled={index === 0}
                        onClick={() =>
                          setRows(rows.filter((_, i) => i !== index))
                        }
                      >
                        <Trash2 />
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                >
                  <Plus />
                  Adicionar faixa
                </Button>
                <Box className="space-y-3 border-t pt-4">
                  <Text weight="medium">Antecipação</Text>
                  <Text size="sm" tone="muted">
                    Se vocês antecipam o recebimento do cartão, a taxa entra nos
                    juros do cliente: 1 mês no à vista e, no parcelado, a média
                    dos meses adiantados ((parcelas + 1) ÷ 2). Em 0%, nada é
                    embutido.
                  </Text>
                  <Row className="gap-y-3">
                    <Col span={6}>
                      <PercentField
                        label="À vista (ao mês)"
                        value={anticipation.single}
                        onChange={(single) => {
                          setAnticipation({ ...anticipation, single });
                          setError(null);
                        }}
                      />
                    </Col>
                    <Col span={6}>
                      <PercentField
                        label="Parcelado (ao mês)"
                        value={anticipation.installments}
                        onChange={(installments) => {
                          setAnticipation({ ...anticipation, installments });
                          setError(null);
                        }}
                      />
                    </Col>
                  </Row>
                </Box>
                {error && <Alert>{error}</Alert>}
                <Box className="flex flex-wrap justify-end gap-2">
                  {!data.isDefault && (
                    <Button
                      variant="ghost"
                      disabled={save.isPending}
                      onClick={() => onSave(null)}
                    >
                      Voltar às taxas padrão
                    </Button>
                  )}
                  <Button
                    disabled={save.isPending}
                    onClick={() => onSave(rows.map(toBand))}
                  >
                    {save.isPending && (
                      <Spinner className="text-primary-foreground" />
                    )}
                    Salvar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Col>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exemplo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MoneyField
                  label="Valor da cobrança"
                  value={exampleAmount}
                  onChange={setExampleAmount}
                />
                <SwitchField
                  label="Repassar a antecipação"
                  hint="Como na cobrança com a caixa Antecipação marcada. Desligado (o padrão), o cliente não paga a antecipação."
                  checked={passAnticipation}
                  onChange={setPassAnticipation}
                />
                {preview.isError && (
                  <Alert variant="warning">
                    {toApiError(preview.error).message} Ajuste para ver o
                    exemplo.
                  </Alert>
                )}
                <Table
                  aria-busy={preview.isFetching}
                  className={cn(
                    "transition-opacity",
                    preview.isFetching && "opacity-60",
                  )}
                >
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Parcelas</TableHead>
                      <TableHead className="text-right">Parcela</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {hasReceived && (
                        <>
                          <TableHead className="text-right">
                            Sem antecipar
                          </TableHead>
                          <TableHead className="text-right">
                            Antecipando
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((o) => (
                      <TableRow key={o.installments}>
                        <TableCell>{o.installments}×</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(o.perInstallment)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(o.total)}
                        </TableCell>
                        {hasReceived && (
                          <>
                            <ReceivedCell
                              value={o.received}
                              amount={shownAmount}
                            />
                            <ReceivedCell
                              value={o.receivedAnticipating}
                              amount={shownAmount}
                            />
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Text size="xs" tone="muted">
                  Quanto vocês recebem depois da taxa real do Asaas, sem
                  antecipar e antecipando. Em vermelho, abaixo do valor da
                  cobrança: vocês absorvem parte da taxa — se for antecipar,
                  marque Antecipação na cobrança. Acompanha o que você digita;
                  só vale nas cobranças depois de salvar.
                </Text>
              </CardContent>
            </Card>
          </Col>
        </Row>
      )}
    </Box>
  );
}

/** What the company receives (red when below the charge's amount). */
function ReceivedCell({
  value,
  amount,
}: {
  value: number | null | undefined;
  amount: number;
}) {
  return (
    <TableCell
      className={cn(
        "text-right",
        value != null && value < amount - 0.005 && "text-destructive",
      )}
    >
      {value != null ? formatCurrency(value) : "—"}
    </TableCell>
  );
}
