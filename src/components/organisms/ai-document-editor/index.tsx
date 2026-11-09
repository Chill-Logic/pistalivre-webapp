import { Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import type { AiChatPanelProps } from "@/components/organisms/ai-chat-panel";
import { ProposalHtmlEditor } from "@/components/organisms/proposal-html-editor";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";

type AiDocumentEditorProps = {
  /** The text merged by the server (the draft route). */
  initialHtml: string;
  /** The AI is configured (the draft says); the chat also needs tools. */
  aiEnabled: boolean;
  /** What the editor is for, above it. */
  intro: string;
  label: string;
  cancelTo: string;
  /** The assistant beside the editor (mode, chips, the record it reads). */
  chat: Omit<AiChatPanelProps, "html" | "onApply" | "className">;
  onPreview: (html: string) => void;
  previewing: boolean;
  onSave: (html: string) => void;
  saving: boolean;
  /** Why the last save failed (stays with the editor). */
  error?: string | null;
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
  error,
}: AiDocumentEditorProps) {
  const chatAvailable = useAiChatAvailable() && aiEnabled;
  const [html, setHtml] = useState(initialHtml);
  const [version, setVersion] = useState(0);

  // The assistant changed the text (or Desfazer): reload the editor with it.
  const applyAi = (next: string) => {
    setHtml(next);
    setVersion((v) => v + 1);
  };

  const empty = !html.trim();

  const editor = (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Text tone="muted">{intro}</Text>

        <ProposalHtmlEditor
          key={version}
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
          <Button
            type="button"
            onClick={() => onSave(html)}
            disabled={saving || empty}
          >
            {saving && <Spinner className="text-primary-foreground" />}
            {saving ? "Gerando PDF…" : "Gerar PDF e salvar"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (!chatAvailable) return editor;
  return (
    <Row className="gap-y-4">
      <Col lg={8} className="order-2 lg:order-1">
        {editor}
      </Col>
      <Col lg={4} className="order-1 lg:order-2">
        <AiChatDock {...chat} html={html} onApply={applyAi} />
      </Col>
    </Row>
  );
}
