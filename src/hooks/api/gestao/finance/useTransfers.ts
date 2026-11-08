import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { transfersService } from "@/services/api/gestao/transfers.service";

/** History of pix the platform already sent (read-only). */
export function useTransfers() {
  return useQuery({
    queryKey: queryKeys.finance.transfers(),
    queryFn: transfersService.list,
  });
}
