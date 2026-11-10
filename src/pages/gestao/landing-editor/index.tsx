import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Eye, RotateCcw, Rocket, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { LANDING_INITIAL_DATA, landingConfig } from "@/components/organisms/landing-editor/config";
import { LandingVersionsDialog } from "@/components/organisms/landing-versions-dialog";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/helpers/api-error";
import { forgetLegacyLandingDraft, readLegacyLandingDraft } from "@/helpers/landing";
import { useLandingPage } from "@/hooks/api/gestao/landing/useLandingPage";
import { useLandingWrites } from "@/hooks/api/gestao/landing/useLandingWrites";
import type { LandingPageState } from "@/types/landing";
import { formatDateTime } from "@/utils/format";

const VIEWPORTS = [
  { width: 390, height: "auto" as const, label: "Celular", icon: "Smartphone" as const },
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
];

/** What the editor opens with: the draft, else what is live, else the template. */
function startingData(state: LandingPageState): Data {
  return state.draft ?? state.published ?? readLegacyLandingDraft() ?? LANDING_INITIAL_DATA;
}

function LandingEditor({ state }: { state: LandingPageState }) {
  const { saveDraft, publish } = useLandingWrites();
  // Puck reads `data` once: a new key remounts it (restore, template).
  const [editor, setEditor] = useState({ key: 0, data: startingData(state) });
  // Puck keeps its own state; the latest version is kept here for the buttons.
  const latest = useRef<Data>(editor.data);
  const [dirty, setDirty] = useState(false);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const remount = (data: Data) => {
    latest.current = data;
    setEditor((current) => ({ key: current.key + 1, data }));
  };

  const save = async () => {
    await saveDraft.mutateAsync(latest.current);
    setDirty(false);
    forgetLegacyLandingDraft();
  };

  const onSave = () =>
    save().then(
      () => toast.success("Rascunho salvo"),
      (error) => toast.error(errorMessage(error)),
    );

  const onPublish = async () => {
    try {
      await save();
      await publish.mutateAsync();
      toast.success("Publicado em pistalivrelocacoes.com.br");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const busy = saveDraft.isPending || publish.isPending;
  const pending = dirty || state.hasUnpublishedChanges || !state.publishedAt;

  return (
    <Puck
      key={editor.key}
      config={landingConfig}
      data={editor.data}
      onChange={(data) => {
        latest.current = data;
        setDirty(true);
      }}
      onPublish={() => void onPublish()}
      headerTitle="Site · pistalivrelocacoes.com.br"
      viewports={VIEWPORTS}
      height="100%"
      renderHeaderActions={() => (
        <Box className="flex flex-wrap items-center justify-end gap-2">
          <Box className="hidden text-right lg:block">
            <Text size="xs" tone="muted">
              {state.publishedAt
                ? `No ar desde ${formatDateTime(state.publishedAt)}${state.publishedBy ? ` · ${state.publishedBy.name}` : ""}`
                : "Ainda não publicado"}
            </Text>
            {pending && (
              <Badge variant="outline" className="font-normal">
                {dirty ? "Alterações não salvas" : "Rascunho diferente do site"}
              </Badge>
            )}
          </Box>
          <LandingVersionsDialog onRestored={(next) => next.draft && remount(next.draft)} />
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="ghost">
                <RotateCcw />
                Modelo
              </Button>
            }
            title="Recomeçar do modelo?"
            description="O editor volta para o modelo inicial. Nada muda no rascunho salvo nem no site até você salvar ou publicar."
            confirmLabel="Recomeçar"
            onConfirm={() => {
              remount(LANDING_INITIAL_DATA);
              setDirty(true);
            }}
          />
          <Button size="sm" variant="outline" asChild>
            <Link to={ROUTES.landingPreview}>
              <Eye />
              Prévia
            </Link>
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={onSave}>
            {saveDraft.isPending && !publish.isPending ? <Spinner /> : <Save />}
            Salvar
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" disabled={busy}>
                {publish.isPending ? <Spinner className="text-primary-foreground" /> : <Rocket />}
                Publicar
              </Button>
            }
            title="Publicar o site?"
            description="O rascunho é salvo e passa a ser o que todo mundo vê em pistalivrelocacoes.com.br. A versão anterior fica em Versões."
            confirmLabel="Publicar"
            onConfirm={() => void onPublish()}
          />
        </Box>
      )}
    />
  );
}

/** pistalivrelocacoes.com.br built from blocks: draft on the server, publish, versions. */
export function LandingEditorPage() {
  const page = useLandingPage();
  return (
    // The editor's library only has a light UI: keep the light palette here.
    <Box className="theme-light -m-4 h-[calc(100dvh-3.5rem)] overflow-hidden bg-background text-foreground md:-m-6">
      <QueryBoundary query={page} label="Carregando o site" skeleton={<LandingEditorSkeleton />}>
        {(state) => <LandingEditor state={state} />}
      </QueryBoundary>
    </Box>
  );
}

function LandingEditorSkeleton() {
  return (
    <Box className="flex h-full flex-col">
      <Box className="flex h-14 items-center justify-between border-b px-4">
        <Skeleton className="h-6 w-56" />
        <Box className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </Box>
      </Box>
      <Box className="flex flex-1">
        <Skeleton className="m-4 w-64 rounded-md" />
        <Skeleton className="m-4 flex-1 rounded-md" />
        <Skeleton className="m-4 w-72 rounded-md" />
      </Box>
    </Box>
  );
}
