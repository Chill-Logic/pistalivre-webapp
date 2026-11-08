import { useQuery } from "@tanstack/react-query";
import { CONTRACT_OPTIONS_KEY } from "@/helpers/contract";
import { contractsService } from "@/services/api/gestao/contracts.service";

/**
 * Whether "Personalizar com IA" exists (contracts and proposals). Until it
 * answers, `aiEnabled` is false: the button never shows to then fail.
 */
export function useContractOptions() {
  const query = useQuery({
    queryKey: CONTRACT_OPTIONS_KEY,
    queryFn: contractsService.options,
    staleTime: Infinity,
  });
  return { ...query, aiEnabled: query.data?.aiEnabled ?? false };
}
