import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { failedSources } from "@/helpers/statement";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StatementSourceSummary } from "@/types/statement";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

/**
 * Closing of the period per account: inflow, outflow, result. Truncated totals
 * say "(parcial)" — a silently cut total is worse than none. Transfers between
 * our own accounts are out of the totals and reported apart.
 */
export function StatementTotals({
  sources,
}: {
  sources: StatementSourceSummary[];
}) {
  const { label } = useLabels();
  const failed = failedSources(sources);
  const working = sources.filter((source) => !source.error);

  return (
    <Box className="space-y-3">
      {failed.map((source) => (
        <Alert key={source.source} variant="warning">
          {label(LABEL_MAPS.statementSource, source.source)}: {source.error}
        </Alert>
      ))}
      <Row className="gap-y-4">
        {working.map(({ source, totals, truncated }) => {
          const partial = truncated ? " (parcial)" : "";
          return (
            <Col key={source} md={working.length > 1 ? 6 : 12}>
              <Card>
                <CardContent className="space-y-3 p-4 md:p-5">
                  <Text weight="semibold">
                    {label(LABEL_MAPS.statementSource, source)}
                  </Text>
                  <Row className="gap-y-2">
                    <Col span={4}>
                      <Text size="xs" tone="muted">
                        Entradas{partial}
                      </Text>
                      <Text
                        weight="medium"
                        className="tabular-nums text-success-foreground"
                      >
                        {formatCurrency(totals.inflow)}
                      </Text>
                    </Col>
                    <Col span={4}>
                      <Text size="xs" tone="muted">
                        Saídas{partial}
                      </Text>
                      <Text weight="medium" className="tabular-nums">
                        {formatCurrency(totals.outflow)}
                      </Text>
                    </Col>
                    <Col span={4}>
                      <Text size="xs" tone="muted">
                        Resultado{partial}
                      </Text>
                      <Text
                        weight="semibold"
                        tone={totals.net < 0 ? "destructive" : "foreground"}
                        className="tabular-nums"
                      >
                        {formatCurrency(totals.net)}
                      </Text>
                    </Col>
                  </Row>
                  {totals.internalCount > 0 && (
                    <Text size="xs" tone="muted">
                      Fora dos totais:{" "}
                      {pluralize(
                        totals.internalCount,
                        "transferência entre as nossas contas",
                        "transferências entre as nossas contas",
                      )}{" "}
                      (entradas {formatCurrency(totals.internalIn)} · saídas{" "}
                      {formatCurrency(totals.internalOut)})
                    </Text>
                  )}
                </CardContent>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Box>
  );
}

export function StatementTotalsSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-4 md:p-5">
        <Skeleton shape="text" className="w-16 text-sm" />
        <Row className="gap-y-2">
          {[0, 1, 2].map((index) => (
            <Col key={index} span={4} className="space-y-2">
              <Skeleton shape="text" className="w-14 text-xs" />
              <Skeleton shape="text" className="w-20 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
