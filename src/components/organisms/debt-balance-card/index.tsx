import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Meter } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { elapsedLabel, PAID_METER_COLOR, paidShare } from "@/helpers/debt";
import type { DebtDetail } from "@/types/debt";
import { formatCurrency, formatDateTime } from "@/utils/format";

function Line({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Box className="flex items-baseline justify-between gap-3">
      <Text tone="muted">{label}</Text>
      <Text weight={strong ? "semibold" : "normal"} className="tabular-nums">
        {value}
      </Text>
    </Box>
  );
}

/** Balance derived by the API: principal + interest − amortized. */
export function DebtBalanceCard({ debt }: { debt: DebtDetail }) {
  const { balance } = debt;
  const elapsed = elapsedLabel(balance.elapsedPeriods);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saldo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Box className="space-y-1">
          <Text size="xs" tone="muted">
            Falta pagar
          </Text>
          <Text size="2xl" weight="bold" className="tabular-nums">
            {formatCurrency(balance.outstanding)}
          </Text>
        </Box>
        <Meter value={paidShare(debt)} color={PAID_METER_COLOR} />
        <Box className="space-y-1.5">
          <Line
            label="Valor emprestado"
            value={formatCurrency(balance.principal)}
          />
          {balance.interest > 0 && (
            <Line label="Juros" value={formatCurrency(balance.interest)} />
          )}
          <Line label="Total" value={formatCurrency(balance.total)} strong />
          <Line label="Abatido" value={formatCurrency(balance.paid)} />
          {balance.disbursed !== balance.paid && (
            <Line
              label="Saiu do caixa"
              value={formatCurrency(balance.disbursed)}
            />
          )}
          {balance.surcharge > 0 && (
            <Line
              label="Multa/juros de atraso"
              value={formatCurrency(balance.surcharge)}
            />
          )}
          {balance.discount > 0 && (
            <Line label="Descontos" value={formatCurrency(balance.discount)} />
          )}
        </Box>
        {balance.accruedUntil && !balance.settled && (
          <Text size="xs" tone="muted">
            Juros calculados até {formatDateTime(balance.accruedUntil)}
            {elapsed && ` · ${elapsed} corridos`}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

export function DebtBalanceCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-16 text-base" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton shape="text" className="w-32 text-2xl" />
        <Skeleton className="h-2.5" />
        {[0, 1, 2].map((index) => (
          <Box key={index} className="flex justify-between">
            <Skeleton shape="text" className="w-24 text-sm" />
            <Skeleton shape="text" className="w-20 text-sm" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
