import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Eye, FileJson, Save } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { landingConfig } from "@/components/organisms/landing-editor/config";
import { ROUTES } from "@/constants/routes";
import { saveBlob } from "@/helpers/files";
import { useLandingDraft } from "@/hooks/ui/useLandingDraft";

const VIEWPORTS = [
  { width: 390, height: "auto" as const, label: "Celular", icon: "Smartphone" as const },
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
];

/** POC: build pistalivrelocacoes.com.br by dragging blocks (draft only, no publishing). */
export function LandingEditorPage() {
  const { draft, save } = useLandingDraft();
  // Puck keeps its own state; the latest version is kept here for the buttons.
  const latest = useRef<Data>(draft);

  const saveDraft = () => {
    save(latest.current);
    toast.success("Rascunho salvo neste navegador");
  };

  return (
    <Box className="-m-4 h-[calc(100dvh-3.5rem)] overflow-hidden md:-m-6">
      <Puck
        config={landingConfig}
        data={draft}
        onChange={(data) => {
          latest.current = data;
        }}
        onPublish={(data) => {
          latest.current = data;
          saveDraft();
        }}
        headerTitle="Landing · pistalivrelocacoes.com.br"
        viewports={VIEWPORTS}
        height="100%"
        renderHeaderActions={() => (
          <Box className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={ROUTES.landingPreview}>
                <Eye />
                Prévia
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                saveBlob(
                  new Blob([JSON.stringify(latest.current, null, 2)], { type: "application/json" }),
                  "landing-rascunho.json",
                )
              }
            >
              <FileJson />
              Exportar JSON
            </Button>
            <Button size="sm" onClick={saveDraft}>
              <Save />
              Salvar rascunho
            </Button>
          </Box>
        )}
      />
    </Box>
  );
}
