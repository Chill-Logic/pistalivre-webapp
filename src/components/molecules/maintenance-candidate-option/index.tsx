import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import { cn } from "@/utils/cn";
import type { ReimbursementMaintenanceCandidate } from "@/types/staff-reimbursement";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * One maintenance the refund may pay, as a pickable row: day, services,
 * value and workshop; the likely one carries a "Sugestão" badge.
 */
export function MaintenanceCandidateOption({
  candidate,
  selected,
  onSelect,
  disabled,
}: {
  candidate: ReimbursementMaintenanceCandidate;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const { label } = useLabels();
  const services = candidate.services
    .map((code) => label(LABEL_MAPS.maintenanceService, code))
    .join(", ");
  const Icon = selected ? CheckCircle2 : Circle;

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "h-auto w-full justify-start gap-3 whitespace-normal px-3 py-2.5 text-left font-normal",
        selected && "border-foreground bg-accent",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0 self-start", !selected && "text-muted-foreground")}
        aria-hidden
      />
      <Box className="min-w-0 flex-1 space-y-0.5">
        <Box className="flex flex-wrap items-center gap-2">
          <Text size="sm" weight="medium">
            {formatCalendarDate(candidate.performedAt)} ·{" "}
            {label(LABEL_MAPS.maintenanceType, candidate.type)}
          </Text>
          {candidate.match && (
            <Badge variant="success">
              {candidate.match === "exact" ? "Sugestão · mesmo valor" : "Sugestão"}
            </Badge>
          )}
        </Box>
        <Text size="xs" tone="muted" className="break-words">
          {[
            services || null,
            candidate.provider,
            candidate.rentalCode,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {candidate.description && (
          <Text size="xs" tone="muted" className="line-clamp-2 break-words">
            {candidate.description}
          </Text>
        )}
      </Box>
      <Text size="sm" weight="semibold" className="shrink-0 self-start tabular-nums">
        {candidate.cost != null ? formatCurrency(candidate.cost) : "sem valor"}
      </Text>
    </Button>
  );
}
