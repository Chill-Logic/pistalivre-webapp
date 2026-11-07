import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { LEAD_STAGES } from "@/helpers/crm";
import { useLabels } from "@/hooks/ui/useLabels";
import type { LeadFunnel, LeadStatus } from "@/types/crm";
import { cn } from "@/utils/cn";

type FunnelStagesProps = {
  funnel: LeadFunnel;
  selected: LeadStatus | "";
  /** Tapping a stage filters the list; tapping it again clears. */
  onSelect: (status: LeadStatus | "") => void;
};

/** Stage counters that double as a filter. Scrolls sideways on phones. */
export function FunnelStages({
  funnel,
  selected,
  onSelect,
}: FunnelStagesProps) {
  const { label } = useLabels();

  return (
    <Box className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {LEAD_STAGES.map((stage) => {
        const active = selected === stage;
        return (
          <Button
            key={stage}
            type="button"
            variant="outline"
            aria-pressed={active}
            onClick={() => onSelect(active ? "" : stage)}
            className={cn(
              "h-auto shrink-0 flex-col items-start gap-0.5 bg-card px-3 py-2 md:h-auto",
              active &&
                "border-primary bg-primary/10 text-primary hover:bg-primary/10",
            )}
          >
            <Text
              inline
              size="xs"
              tone={active ? "primary" : "muted"}
              weight="medium"
            >
              {label(LABEL_MAPS.leadStatus, stage)}
            </Text>
            <Text inline size="lg" weight="bold" className="tabular-nums">
              {funnel.byStatus[stage] ?? 0}
            </Text>
          </Button>
        );
      })}
    </Box>
  );
}

export function FunnelStagesSkeleton() {
  return (
    <Box className="flex gap-2 overflow-hidden">
      {LEAD_STAGES.map((stage) => (
        <Skeleton key={stage} className="h-14 w-24 shrink-0" />
      ))}
    </Box>
  );
}
