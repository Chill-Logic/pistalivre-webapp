import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { billingService } from "@/services/api/gestao/billing.service";
import type { RatePeriod } from "@/types/rental";

/** What a change of periodicity would do, as the server computes it. */
export function useRateSegmentPreview(
  rentalId: string,
  from: string,
  ratePeriod: RatePeriod,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [
      ...queryKeys.rentals.all,
      "rate-segment-preview",
      rentalId,
      from,
      ratePeriod,
    ],
    queryFn: () =>
      billingService.previewRateSegment(rentalId, from, ratePeriod),
    enabled: enabled && Boolean(from),
  });
}
