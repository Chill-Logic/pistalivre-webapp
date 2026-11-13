import { Eye, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import type { AiChatPanelProps } from "@/components/organisms/ai-chat-panel";
import { ProposalHtmlEditor } from "@/components/organisms/proposal-html-editor";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import type { ContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import type { ContractDraftVia } from "@/types/contract";

const VIA_LABEL: Record<ContractDraftVia, string> = {
  editor: "por outra pessoa (ou outra aba)",
  chat: "pelo assistente de IA",
  mcp: "pela IA conectada (MCP)",
  template: "a partir do modelo",
};

const STATUS_LABEL = {
  saved: "Rascunho salvo",
  dirty: "Alterações ainda não salvas",
  saving: "Salvando…",
  conflict: "Rascunho alterado em outro lugar",
  error: "Não foi possível salvar",
} as const;

type AiDocumentEditorProps = {
  /** The text merged by the server (the draft route). */
  initialHtml: string;
  /** The AI is configured (the draft says); the chat also needs tools. */
  aiEnabled: boolean;
  /** What the editor is for, above it. */
  intro: string;
  label: string;
  cancelTo: string;
  /**
   * The assistant beside the editor (mode, chips, the record it reads). None =
   * the page shows its own (the partner contract's workspace).
   */
  chat?: Omit<AiChatPanelProps, "html" | "onApply" | "className">;
  onPreview: (html: string) => void;
  previewing: boolean;
  onSave: (html: string) => void;
  saving: boolean;
  /** The main action (default "Gerar PDF e salvar"). */
  saveLabel?: string;
  /** While it runs (default "Gerando PDF…"). */
  savingLabel?: string;
  /** Icon before the main action's label. */
  saveIcon?: ReactNode;
  /** Why the last save failed (stays with the editor). */
  error?: string | null;
  /**
   * The text is a draft saved on the server (rental contracts): autosaved,
   * reloaded live when the chat or an MCP client changes it, undoable.
   */
  draft?: ContractDraftSync;
  /** A second way out beside the main one (e.g. "Enviar para assinatura"). */
  extraAction?: {
    label: string;
    icon?: ReactNode;
    onClick: (html: string) => void;
    busy?: boolean;
  };
  /** Shown under the assistant (e.g. the partner contract's calculator). */
  aside?: ReactNode;
};

/**
 * A document to review before it becomes a PDF (rental contract, partner
 * contract): the HTML editor with the AI assistant beside it on the desktop
 * (bottom sheet on the phone) → "Visualizar PDF" → "Gerar PDF e salvar".
 * Only the last one saves; the parent owns the requests.
 */
export function AiDocumentEditor({
  initialHtml,
  aiEnabled,
  intro,
  label,
  cancelTo,
  chat,
  onPreview,
  previewing,
  onSave,
  saving,
  extraAction,
  aside,
  saveLabel = "Gerar PDF e salvar",
  savingLabel = "Gerando PDF…",
  saveIcon,
  error,
  draft,
}: AiDocumentEditorProps) {
  const chatAvailable = useAiChatAvailable() && aiEnabled;
  const [localHtml, setLocalHtml] = useState(initialHtml);
  const [localVersion, setLocalVersion] = useState(0);
  const html = draft ? draft.html : localHtml;
  const setHtml = draft ? draft.setHtml : setLocalHtml;
  const editorKey = draft ? draft.editorKey : localVersion;

  // The assistant changed the text (or Desfazer): reload the editor with it.
  const applyAi = (next: string) => {
    if (draft) {
      // Desfazer in the chat: the old text goes back as an edit (saved, undoable).
      draft.replace(next);
      return;
    }
    setLocalHtml(next);
    setLocalVersion((v) => v + 1);
  };

  const empty = !html.trim();

  const editor = (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Text tone="muted">{intro}</Text>

        {draft && <DraftSyncBar draft={draft} />}

        <ProposalHtmlEditor
          key={editorKey}
          label={label}
          value={html}
          onChange={setHtml}
        />

        {error && <Alert>{error}</Alert>}
        <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost">
            <Link to={cancelTo}>Cancelar</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onPreview(html)}
            disabled={previewing || saving || empty}
          >
            {previewing ? <Spinner /> : <Eye />}
            Visualizar PDF
          </Button>
          {extraAction && (
            <Button
              type="button"
              variant="outline"
              onClick={() => extraAction.onClick(html)}
              disabled={saving || extraAction.busy || empty}
            >
              {extraAction.busy ? <Spinner /> : extraAction.icon}
              {extraAction.label}
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onSave(html)}
            disabled={saving || empty}
          >
            {saving ? (
              <Spinner className="text-primary-foreground" />
            ) : (
              saveIcon
            )}
            {saving ? savingLabel : saveLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (!chatAvailable || !chat) {
    if (!aside) return editor;
    return (
      <Row className="gap-y-4">
        <Col lg={7}>{editor}</Col>
        <Col lg={5}>{aside}</Col>
      </Row>
    );
  }
  // With something under the chat (the calculator), the side column needs room.
  const side = aside ? 5 : 4;
  const main = aside ? 7 : 8;
  return (
    <Row className="gap-y-4">
      <Col lg={main} className="order-2 lg:order-1">
        {editor}
      </Col>
      <Col lg={side} className="order-1 space-y-4 lg:order-2">
        <AiChatDock
          {...chat}
          html={html}
          onApply={applyAi}
          {...(draft
            ? { prepare: draft.flush, draftId: draft.id, onDraft: draft.apply }
            : {})}
        />
        {aside}
      </Col>
    </Row>
  );
}

/**
 * The saved draft's state above the editor: saved/saving, a change loaded
 * from elsewhere (the chat, an MCP client), a conflict to resolve, and the
 * draft's own undo and "start over from the template".
 */
function DraftSyncBar({ draft }: { draft: ContractDraftSync }) {
  return (
    <Box className="space-y-2">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Text
          size="sm"
          tone="muted"
          role="status"
          className="flex items-center gap-2"
        >
          {(draft.status === "saving" || draft.busy) && <Spinner />}
          {STATUS_LABEL[draft.status]}
        </Text>
        <Box className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={draft.undo}
            disabled={
              !draft.canUndo || draft.busy || draft.status === "conflict"
            }
          >
            <Undo2 />
            Desfazer última alteração
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={draft.busy || draft.status === "conflict"}
              >
                <RotateCcw />
                Recomeçar do modelo
              </Button>
            }
            title="Recomeçar do modelo?"
            description="O texto volta ao modelo, com os dados atuais da locação. O texto de agora fica guardado: dá para desfazer."
            confirmLabel="Recomeçar"
            onConfirm={draft.reset}
            isPending={draft.busy}
          />
        </Box>
      </Box>
      {draft.externalVia && draft.status !== "conflict" && (
        <Alert
          variant="info"
          role="note"
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <Text inline size="sm">
            O rascunho foi atualizado {VIA_LABEL[draft.externalVia]}.
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={draft.dismissExternal}
          >
            Ok
          </Button>
        </Alert>
      )}
      {draft.status === "conflict" && (
        <Alert variant="warning" className="space-y-2">
          <Text size="sm">
            Enquanto você editava, o rascunho foi alterado
            {draft.conflict
              ? ` ${VIA_LABEL[draft.conflict.updatedVia]}`
              : " em outro lugar"}
            . Qual versão fica?
          </Text>
          <Box className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={draft.takeTheirs}
              disabled={!draft.conflict}
            >
              Carregar a versão nova
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={draft.keepMine}
              disabled={!draft.conflict}
            >
              Manter a minha
            </Button>
          </Box>
        </Alert>
      )}
      {draft.error && <Alert>{draft.error}</Alert>}
    </Box>
  );
}
