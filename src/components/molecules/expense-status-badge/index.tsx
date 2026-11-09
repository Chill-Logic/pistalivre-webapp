import { Badge } from "@/components/atoms/badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MonthItemStatus } from "@/types/expense";

// Organization, not judgment: open is neutral, never red.
const VARIANT = {
  OPEN: "outline",
  PARTIAL: "neutral",
  PAID: "success",
  WAIVED: "neutral",
} as const;

export function ExpenseStatusBadge({ status }: { status: MonthItemStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={VARIANT[status]}>
      {label(LABEL_MAPS.expenseStatus, status)}
    </Badge>
  );
}
