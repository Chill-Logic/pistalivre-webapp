import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { openBlobInNewTab } from "@/helpers/files";
import {
  rentStatementService,
  type RentStatementScope,
} from "@/services/api/comum/rent-statement.service";
import type { RentStatementParams } from "@/types/rent-statement";

/** Under the rental's (staff) or the portal's keys, so their invalidation reaches it. */
const statementKey = (
  scope: RentStatementScope,
  rentalId: string,
  params: RentStatementParams,
) =>
  [
    ...(scope === "portal" ? queryKeys.portal.all : queryKeys.rentals.all),
    "statement",
    rentalId,
    params,
  ] as const;

export function useRentStatement(
  scope: RentStatementScope,
  rentalId: string,
  params: RentStatementParams,
) {
  return useQuery({
    queryKey: statementKey(scope, rentalId, params),
    queryFn: () => rentStatementService.get(scope, rentalId, params),
    placeholderData: keepPreviousData,
  });
}

/** Opens the statement PDF (Bearer → blob) in a new tab. */
export function useRentStatementPdf(
  scope: RentStatementScope,
  rentalId: string,
) {
  return useMutation({
    mutationFn: (params: RentStatementParams) =>
      openBlobInNewTab(() => rentStatementService.pdf(scope, rentalId, params)),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
