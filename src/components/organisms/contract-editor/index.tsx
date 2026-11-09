import { Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { Col, Row } from "@/components/atoms/grid";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import { ProposalHtmlEditor } from "@/components/organisms/proposal-html-editor";
import { toApiError } from "@/helpers/api-error";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import {
  useContractPreview,
  useCreateContract,
} from "@/hooks/api/gestao/contracts/useContractMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { Contract } from "@/types/contract";

type ContractEditorProps = {
  rentalId: string;
  templateId: string;
  /** The template merged by the server (GET …/contracts/draft). */
  initialHtml: string;
  aiEnabled: boolean;
  cancelTo: string;
  onSaved: (contract: Contract) => void;
};

type Errors = Partial<Record<"save", string>>;

/** Starting points offered by the assistant (it asks for what's missing). */
const CONTRACT_SUGGESTIONS = [
  "Trocar para o plano fidelidade de 30 meses",
  "Ajustar o valor do aluguel desta locação",
  "Incluir caução parcelada em 3 vezes",
  "Revisar o texto e corrigir erros",
];

/**
 * The contract text to review, as in the management app, with the AI
 * assistant beside it (it reads the rental and edits the draft on request) →
 * "Visualizar PDF" → "Gerar PDF e salvar". Only the
 * last one saves (freezes the text, renders the PDF with the signature block
 * the server rebuilds, and attaches it to the rental under "Contrato").
 */
export function ContractEditor({
  rentalId,
  templateId,
  initialHtml,
  aiEnabled,
  cancelTo,
  onSaved,
}: ContractEditorProps) {
  const chatAvailable = useAiChatAvailable() && aiEnabled;
  const preview = useContractPreview();
  const create = useCreateContract(rentalId);
  const idempotency = useIdempotencyKey();

  const [html, setHtml] = useState(initialHtml);
  const [version, setVersion] = useState(0);
  const [errors, setErrors] = useState<Errors>({});

  // The assistant changed the text (or Desfazer): reload the editor with it.
  const applyAi = (next: string) => {
    setHtml(next);
    setVersion((v) => v + 1);
  };

  const save = () => {
    setErrors({});
    create.mutate(
      { key: idempotency.key, input: { templateId, html } },
      {
        onSuccess: (contract) => {
          idempotency.renew();
          onSaved(contract);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors({ save: apiError.fields?.cnh ?? apiError.message });
        },
      },
    );
  };

  const busy = create.isPending;

  const editor = (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">

        <Text tone="muted">
          Revise o contrato abaixo. Você pode ajustar o texto antes de gerar o
          PDF; o que estiver aqui fica congelado no documento. As assinaturas
          entram no fim do PDF.
        </Text>

        <ProposalHtmlEditor
          key={version}
          label="Texto do contrato"
          value={html}
          onChange={setHtml}
        />

        {errors.save && <Alert>{errors.save}</Alert>}
        <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost">
            <Link to={cancelTo}>Cancelar</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => preview.mutate({ rentalId, templateId, html })}
            disabled={preview.isPending || busy || !html.trim()}
          >
            {preview.isPending ? <Spinner /> : <Eye />}
            Visualizar PDF
          </Button>
          <Button type="button" onClick={save} disabled={busy || !html.trim()}>
            {create.isPending && (
              <Spinner className="text-primary-foreground" />
            )}
            {create.isPending ? "Gerando PDF…" : "Gerar PDF e salvar"}
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
        <AiChatDock
          mode="contract"
          html={html}
          onApply={applyAi}
          suggestions={CONTRACT_SUGGESTIONS}
          rentalId={rentalId}
        />
      </Col>
    </Row>
  );
}
