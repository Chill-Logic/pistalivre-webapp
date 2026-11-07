import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { installmentVariant } from "@/helpers/debt";
import { useLabels } from "@/hooks/ui/useLabels";
import type { DebtInstallment } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** Derived plan: payments cover installments in cascade (oldest first). */
export function DebtPlanCard({ plan }: { plan: DebtInstallment[] }) {
  const { label } = useLabels();
  if (plan.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {plan.map((installment) => (
            <ListItem
              key={installment.number}
              className="flex items-center justify-between gap-3 py-3"
            >
              <Box className="min-w-0">
                <Text weight="medium">Parcela {installment.number}</Text>
                <Text size="xs" tone="muted">
                  vence {formatCalendarDate(installment.dueDate)}
                  {installment.status === "PARTIAL" ||
                  (installment.status === "OVERDUE" && installment.paid > 0)
                    ? ` · ${formatCurrency(installment.paid)} pagos`
                    : ""}
                </Text>
              </Box>
              <Box className="shrink-0 space-y-1 text-right">
                <Text weight="semibold" className="tabular-nums">
                  {formatCurrency(installment.amount)}
                </Text>
                <Badge variant={installmentVariant(installment.status)}>
                  {label(LABEL_MAPS.debtInstallmentStatus, installment.status)}
                </Badge>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export function DebtPlanCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        {[0, 1, 2].map((index) => (
          <Box key={index} className="flex items-center justify-between py-3">
            <Box className="space-y-2">
              <Skeleton shape="text" className="w-20 text-sm" />
              <Skeleton shape="text" className="w-28 text-xs" />
            </Box>
            <Skeleton shape="text" className="w-20 text-sm" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
