import type { Data } from "@puckeditor/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { landingService } from "@/services/api/gestao/landing.service";
import type { LandingPageState } from "@/types/landing";

/** Save the draft, publish it, bring an old version back. */
export function useLandingWrites() {
  const queryClient = useQueryClient();
  const store = (state: LandingPageState) => {
    queryClient.setQueryData(queryKeys.landing.page(), state);
  };

  const saveDraft = useMutation({ mutationFn: (data: Data) => landingService.saveDraft(data), onSuccess: store });
  const publish = useMutation({
    mutationFn: landingService.publish,
    onSuccess: (state) => {
      store(state);
      void queryClient.invalidateQueries({ queryKey: queryKeys.landing.versions() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSite.landing() });
    },
  });
  const restore = useMutation({ mutationFn: landingService.restore, onSuccess: store });

  return { saveDraft, publish, restore };
}
