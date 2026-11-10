import { Render } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { landingConfig } from "@/components/organisms/landing-editor/config";
import { ROUTES } from "@/constants/routes";
import { useLandingDraft } from "@/hooks/ui/useLandingDraft";

/** POC: the saved draft as the visitor would see it (read only). */
export function LandingPreviewPage() {
  const { draft } = useLandingDraft();
  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.landingEditor} label="Voltar ao editor" />
      <Box className="-mx-4 overflow-hidden border-y bg-background md:-mx-6">
        <Render config={landingConfig} data={draft} />
      </Box>
    </Box>
  );
}
