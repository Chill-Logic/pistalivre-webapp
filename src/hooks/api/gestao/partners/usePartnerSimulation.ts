import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { partnersService } from "@/services/api/gestao/partners.service";
import type { PartnerSimulationInput } from "@/types/partner-simulation";

/**
 * The calculator's numbers, from the server (money is never computed in the
 * screen). Follows the typing with a short pause and keeps the last result
 * on screen while the next one comes.
 */
export function usePartnerSimulation(input: PartnerSimulationInput | null) {
  const debounced = useDebouncedValue(input, 350);
  return useQuery({
    queryKey: ["partner-contract-simulation", debounced],
    queryFn: () => partnersService.simulateContract(debounced!),
    enabled: debounced !== null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
