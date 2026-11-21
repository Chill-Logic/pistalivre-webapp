import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { useBillingRules } from "@/hooks/api/gestao/billing-rules/useBillingRules";

const percent = (n: number) => `${String(n).replace(".", ",")}%`;

/** One fact of the rules: a big number with what it means. */
function RuleTile({ value, label }: { value: string; label: string }) {
  return (
    <Box className="space-y-1 rounded-lg border p-4">
      <Text className="text-3xl font-semibold tabular-nums">{value}</Text>
      <Text size="sm" tone="muted">
        {label}
      </Text>
    </Box>
  );
}

function BillingRulesSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-5">
        <Row className="gap-y-3">
          {[0, 1, 2].map((i) => (
            <Col key={i} md={4}>
              <Skeleton className="h-24 w-full" />
            </Col>
          ))}
        </Row>
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Configurações › Regras de cobrança: the late fee and interest every new
 * charge uses — and the contract clause reads. Read-only (fixed in the
 * backend); the Livrinho and the MCP answer from the same rules.
 */
export function BillingRulesPage() {
  const rules = useBillingRules();
  const data = rules.data;
  return (
    <Box className="space-y-6">
      <PageHeader title="Regras de cobrança" />
      {rules.isPending && (
        <SkeletonRegion label="Carregando…">
          <BillingRulesSkeleton />
        </SkeletonRegion>
      )}
      {rules.isError && <QueryError error={rules.error} onRetry={() => rules.refetch()} />}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multa e juros por atraso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row className="gap-y-3">
              <Col md={4}>
                <RuleTile value={percent(data.finePercent)} label="de multa sobre a cobrança vencida" />
              </Col>
              <Col md={4}>
                <RuleTile value={percent(data.interestPercentPerMonth)} label="de juros ao mês, contados por dia" />
              </Col>
              <Col md={4}>
                <RuleTile
                  value={data.dailyRentExempt ? "Sem multa" : "Com multa"}
                  label="no aluguel da diária (o valor da diária já embute o atraso)"
                />
              </Col>
            </Row>
            <Box className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <Text size="sm">Valem {data.from}.</Text>
              {data.notes.map((note) => (
                <Text key={note} size="sm" tone="muted">
                  {note}
                </Text>
              ))}
              <Text size="sm" tone="muted">
                A cláusula de atraso dos modelos de contrato usa estes mesmos números. Para mudar a regra, fale com o
                administrador do sistema.
              </Text>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
