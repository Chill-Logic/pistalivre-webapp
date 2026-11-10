import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { landingService } from "@/services/api/gestao/landing.service";

/** The site's draft and published versions (who saved, who published). */
export function useLandingPage() {
  return useQuery({ queryKey: queryKeys.landing.page(), queryFn: landingService.get });
}

/** The last publications, to bring one back into the draft. */
export function useLandingVersions(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.landing.versions(),
    queryFn: landingService.versions,
    enabled,
  });
}
