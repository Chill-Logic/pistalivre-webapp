import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { publicLandingService } from "@/services/api/comum/public-landing.service";

/** The published landing and the company's name/WhatsApp. */
export function usePublicLanding() {
  return useQuery({
    queryKey: queryKeys.publicSite.landing(),
    queryFn: publicLandingService.landing,
    staleTime: 60_000,
  });
}

/** Active catalogue items, as the public sees them. */
export function usePublicCatalog() {
  return useQuery({
    queryKey: queryKeys.publicSite.catalog(),
    queryFn: publicLandingService.catalog,
    staleTime: 60_000,
  });
}

/** Active plans, with price and terms written by the server. */
export function usePublicPlans() {
  return useQuery({
    queryKey: queryKeys.publicSite.plans(),
    queryFn: publicLandingService.plans,
    staleTime: 60_000,
  });
}
