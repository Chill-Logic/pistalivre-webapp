import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { signaturesService } from "@/services/api/gestao/signatures.service";

export function useSignature(id: string) {
  return useQuery({
    queryKey: queryKeys.signatures.detail(id),
    queryFn: () => signaturesService.get(id),
  });
}
