import { Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { AiPersonalizeBox } from "@/components/molecules/ai-personalize-box";
import { ProposalHtmlEditor } from "@/components/organisms/proposal-html-editor";
import { toApiError } from "@/helpers/api-error";
import {
  useContractPreview,
  useCreateContract,
  usePersonalizeContract,
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

type Errors = Partial<Record<"ai" | "save", string>>;

/**
 * The contract text to review, as in the management app: optionally
 * rewritten by the AI → "Visualizar PDF" → "Gerar PDF e salvar". Only the
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
  const personalize = usePersonalizeContract();
  const preview = useContractPreview();
  const create = useCreateContract(rentalId);
  const idempotency = useIdempotencyKey();

  const [html, setHtml] = useState(initialHtml);
  const [version, setVersion] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const runAi = () => {
    setErrors({});
    personalize.mutate(
      { html, instructions: instructions.trim(), rentalId },
      {
        onSuccess: (next) => {
          // Loads the AI's version into the editor (remounts it).
          setHtml(next);
          setVersion((v) => v + 1);
        },
        onError: (error) => setErrors({ ai: toApiError(error).message }),
      },
    );
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

  const busy = personalize.isPending || create.isPending;

  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        {aiEnabled && (
          <AiPersonalizeBox
            label="Acordos feitos com o cliente"
            placeholder="Ex.: plano fidelidade de 30 meses; caução parcelada em 3x de R$ 217; carência de 7 dias para a 1ª cobrança."
            hint="Descreva os acordos (caução, prazos, cláusulas extras…). A IA reescreve o contrato abaixo; você revisa antes de gerar o PDF."
            instructions={instructions}
            onInstructionsChange={setInstructions}
            onRun={runAi}
            isPending={personalize.isPending}
            disabled={busy}
            error={errors.ai}
          />
        )}

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
}
