import { useState } from "react";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { toApiError } from "@/helpers/api-error";
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
  const preview = useContractPreview();
  const create = useCreateContract(rentalId);
  const idempotency = useIdempotencyKey();
  const [error, setError] = useState<string | null>(null);

  const save = (html: string) => {
    setError(null);
    create.mutate(
      { key: idempotency.key, input: { templateId, html } },
      {
        onSuccess: (contract) => {
          idempotency.renew();
          onSaved(contract);
        },
        onError: (failure) => {
          const apiError = toApiError(failure);
          setError(apiError.fields?.cnh ?? apiError.message);
        },
      },
    );
  };

  return (
    <AiDocumentEditor
      initialHtml={initialHtml}
      aiEnabled={aiEnabled}
      intro="Revise o contrato abaixo. Você pode ajustar o texto antes de gerar o PDF; o que estiver aqui fica congelado no documento. As assinaturas entram no fim do PDF."
      label="Texto do contrato"
      cancelTo={cancelTo}
      chat={{ mode: "contract", suggestions: CONTRACT_SUGGESTIONS, rentalId }}
      onPreview={(html) => preview.mutate({ rentalId, templateId, html })}
      previewing={preview.isPending}
      onSave={save}
      saving={create.isPending}
      error={error}
    />
  );
}
