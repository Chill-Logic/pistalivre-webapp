import { useState } from "react";
import { Box } from "@/components/atoms/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Spinner } from "@/components/atoms/spinner";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import { LeadLostDialog } from "@/components/organisms/lead-lost-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CrmOptions, LeadListItem, LeadStatus } from "@/types/crm";
import { cn } from "@/utils/cn";

type LeadStageSelectProps = {
  lead: LeadListItem;
  options: CrmOptions;
  className?: string;
};

/**
 * Moves the lead right from the list row (owner's call). "Perdido" opens the
 * loss reasons; "Ganho" is confirmed (it closes the lead). A closed lead
 * (won/lost) only shows its badge: the way forward is reopening it.
 *
 * Clicks stop here, so the row (or card) around it doesn't open the lead.
 */
export function LeadStageSelect({
  lead,
  options,
  className,
}: LeadStageSelectProps) {
  const { label } = useLabels();
  const { status } = useLeadActions(lead.id);
  const [losing, setLosing] = useState(false);
  const [winning, setWinning] = useState(false);
  const stageLabel = (code: string) => label(LABEL_MAPS.leadStatus, code);

  if (lead.status === "WON" || lead.status === "LOST") {
    return <LeadStatusBadge status={lead.status} isTest={lead.isTest} />;
  }

  const pick = (value: string) => {
    const next = value as LeadStatus;
    if (next === lead.status) return;
    if (next === "LOST") setLosing(true);
    else if (next === "WON") setWinning(true);
    else status.mutate(next);
  };

  return (
    <Box
      className={cn("flex items-center gap-2", className)}
      onClick={(event) => event.stopPropagation()}
    >
      <Select
        value={lead.status}
        onValueChange={pick}
        disabled={status.isPending}
      >
        <SelectTrigger
          aria-label={`Estágio de ${lead.name}`}
          className="h-9 w-36 md:h-8"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.statuses.map((code) => (
            <SelectItem key={code} value={code}>
              {stageLabel(code)}
            </SelectItem>
          ))}
          <SelectItem value="LOST" className="text-destructive">
            {stageLabel("LOST")}
          </SelectItem>
        </SelectContent>
      </Select>
      {status.isPending && <Spinner />}
      {losing && (
        <LeadLostDialog
          leadId={lead.id}
          reasons={options.lostReasons}
          defaultOpen
          onClose={() => setLosing(false)}
        />
      )}
      <ConfirmDialog
        open={winning}
        onOpenChange={setWinning}
        title={`Mover ${lead.name} para ${stageLabel("WON")}?`}
        description="Ganho encerra o lead: ele não muda mais de estágio. Fica registrado na trilha."
        confirmLabel="Mover"
        isPending={status.isPending}
        onConfirm={() =>
          status.mutate("WON", { onSuccess: () => setWinning(false) })
        }
      />
    </Box>
  );
}
