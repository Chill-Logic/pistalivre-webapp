import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Eye, FileJson, RotateCcw, Save } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { landingConfig } from "@/components/organisms/landing-editor/config";
import { ROUTES } from "@/constants/routes";
import { saveBlob } from "@/helpers/files";
import { LANDING_INITIAL_DATA } from "@/components/organisms/landing-editor/config";
import { useLandingDraft } from "@/hooks/ui/useLandingDraft";

const VIEWPORTS = [
  { width: 390, height: "auto" as const, label: "Celular", icon: "Smartphone" as const },
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
];

/** POC: build pistalivrelocacoes.com.br by dragging blocks (draft only, no publishing). */
export function LandingEditorPage() {
  const { draft, save, reset } = useLandingDraft();
  // Puck reads `data` once: a new key remounts it with the reset draft.
  const [editorKey, setEditorKey] = useState(0);
  // Puck keeps its own state; the latest version is kept here for the buttons.
  const latest = useRef<Data>(draft);

  const saveDraft = () => {
    save(latest.current);
    toast.success("Rascunho salvo neste navegador");
  };

  return (
    // The editor's library only has a light UI: keep the light palette here.
    <Box className="theme-light -m-4 h-[calc(100dvh-3.5rem)] overflow-hidden bg-background text-foreground md:-m-6">
      <Puck
        key={editorKey}
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
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="ghost">
                  <RotateCcw />
                  Recomeçar do modelo
                </Button>
              }
              title="Recomeçar do modelo?"
              description="O rascunho salvo neste navegador é trocado pelo modelo inicial. Exporte o JSON antes se quiser guardar o atual."
              confirmLabel="Recomeçar"
              destructive
              onConfirm={() => {
                reset();
                latest.current = LANDING_INITIAL_DATA;
                setEditorKey((key) => key + 1);
                toast.success("Rascunho trocado pelo modelo inicial");
              }}
            />
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
