import { Render } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { LANDING_INITIAL_DATA, landingConfig } from "@/components/organisms/landing-editor/config";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES } from "@/constants/routes";
import { useLandingPage } from "@/hooks/api/gestao/landing/useLandingPage";

/** The saved draft as the visitor would see it (read only, nothing published). */
export function LandingPreviewPage() {
  const page = useLandingPage();
  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.landingEditor} label="Voltar ao editor" />
      <Box className="-mx-4 overflow-hidden border-y bg-background md:-mx-6">
        <QueryBoundary query={page} label="Carregando a prévia" skeleton={<Skeleton className="h-[70dvh] rounded-none" />}>
          {(state) => (
            <Render config={landingConfig} data={state.draft ?? state.published ?? LANDING_INITIAL_DATA} />
          )}
        </QueryBoundary>
      </Box>
    </Box>
  );
}
