import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { CautionPlanItem } from "@/types/charge";
import type { RentalDetail } from "@/types/rental";
import { addDays, todayInBrasilia } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** Same antecedence as the server job (rent and caução). */
const LOOKAHEAD_DAYS = 3;

type CautionAutoToggleProps = {
  rentalId: string;
  enabled: boolean;
  /** The caução plan (labels, dates, already charged) — for the confirmation. */
  plan: CautionPlanItem[];
};

/**
 * What turning it on will do, said before confirming (owner, 2026-11-15):
 * the next parcel, its value, when it is due and when it goes out (3 days
 * before, or at the next hourly run if it is that close). Overdue parcels
 * never charged are not emitted by it — the button "Emitir cobrança" is.
 */
function nextChargeText(plan: CautionPlanItem[]) {
  const today = todayInBrasilia();
  const future = plan
    .filter((item) => !item.emitted && item.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = plan.filter((item) => !item.emitted && item.dueDate < today).length;
  const lines: string[] = [];
  const next = future[0];
  if (!next) {
    lines.push("Não há parcela futura para cobrar: todas já foram emitidas ou já venceram.");
  } else {
    const sendOn = addDays(next.dueDate, -LOOKAHEAD_DAYS);
    const when =
      sendOn <= today
        ? "sai na próxima rodada (em até 1 hora)"
        : `sai em ${formatCalendarDate(sendOn)}, 3 dias antes`;
    lines.push(
      `Próxima cobrança: ${next.label} · ${formatCurrency(next.amount)}, vence em ${formatCalendarDate(next.dueDate)} e ${when}.`,
    );
    if (future.length > 1) {
      lines.push(`Depois dela, mais ${future.length - 1} parcela(s), uma de cada vez.`);
    }
  }
  if (overdue > 0) {
    lines.push(
      `${overdue} parcela(s) já vencida(s) sem cobrança não saem sozinhas: use "Emitir cobrança".`,
    );
  }
  return lines.join(" ");
}

/**
 * "Cobrança automática" of the caução: the next parcels go out by themselves
 * 3 days before they are due, numbered ("Parcela 2/4"). Turning it on asks
 * first, showing the next charge.
 */
export function CautionAutoToggle({ rentalId, enabled, plan }: CautionAutoToggleProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const toggle = useMutation({
    mutationFn: () => rentalsService.setCautionAutoBilling(rentalId, !enabled),
    onSuccess: (rental) => {
      queryClient.setQueryData<RentalDetail>(queryKeys.rentals.detail(rentalId), (previous) =>
        previous ? { ...previous, cautionAutoBilling: rental.cautionAutoBilling } : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      setConfirming(false);
      toast.success(
        rental.cautionAutoBilling
          ? "Cobrança automática da caução ligada"
          : "Cobrança automática da caução desligada",
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Box className="space-y-1 rounded-md border p-3">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Box className="flex items-center gap-2">
          <Text size="sm" weight="medium">
            Cobrança automática
          </Text>
          <Badge variant={enabled ? "success" : "neutral"}>{enabled ? "Ligada" : "Desligada"}</Badge>
        </Box>
        {enabled ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
          >
            {toggle.isPending && <Spinner />}
            Desligar
          </Button>
        ) : (
          <ConfirmDialog
            open={confirming}
            onOpenChange={(open) => !toggle.isPending && setConfirming(open)}
            trigger={
              <Button type="button" size="sm" variant="outline">
                Ligar
              </Button>
            }
            title="Ligar a cobrança automática da caução?"
            description={nextChargeText(plan)}
            confirmLabel="Ligar"
            isPending={toggle.isPending}
            onConfirm={() => toggle.mutate()}
          />
        )}
      </Box>
      <Text size="xs" tone="muted">
        As próximas parcelas saem sozinhas, 3 dias antes de vencer.
      </Text>
    </Box>
  );
}
