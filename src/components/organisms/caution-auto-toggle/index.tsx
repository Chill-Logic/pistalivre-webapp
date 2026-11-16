import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { rentalsService } from "@/services/api/gestao/rentals.service";
import type { RentalDetail } from "@/types/rental";

type CautionAutoToggleProps = {
  rentalId: string;
  enabled: boolean;
};

/**
 * "Cobrança automática" of the caução: the next parcels go out by themselves
 * 3 days before they are due, numbered ("Parcela 2/4"). Overdue and never
 * charged stays with the team (the "Emitir cobrança" button).
 */
export function CautionAutoToggle({ rentalId, enabled }: CautionAutoToggleProps) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: () => rentalsService.setCautionAutoBilling(rentalId, !enabled),
    onSuccess: (rental) => {
      queryClient.setQueryData<RentalDetail>(queryKeys.rentals.detail(rentalId), (previous) =>
        previous ? { ...previous, cautionAutoBilling: rental.cautionAutoBilling } : previous,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => toggle.mutate()}
          disabled={toggle.isPending}
        >
          {toggle.isPending && <Spinner />}
          {enabled ? "Desligar" : "Ligar"}
        </Button>
      </Box>
      <Text size="xs" tone="muted">
        As próximas parcelas saem sozinhas, 3 dias antes de vencer.
      </Text>
    </Box>
  );
}
