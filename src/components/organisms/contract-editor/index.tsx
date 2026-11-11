import { useState } from "react";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { toApiError } from "@/helpers/api-error";
import {
  useContractPreview,
  useCreateContract,
} from "@/hooks/api/gestao/contracts/useContractMutations";
import { useContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import type { Contract, ContractDraftState } from "@/types/contract";

type ContractEditorProps = {
  rentalId: string;
  templateId: string;
  /** The draft saved on the server (GET …/contracts/draft): editor, chat and MCP share it. */
  draft: ContractDraftState;
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
 * assistant beside it (it reads the rental and edits the draft on request).
 * The text is a draft saved on the server — autosaved, and reloaded live
 * when the chat or an AI connected by MCP changes it →
 * "Visualizar PDF" → "Gerar PDF e salvar". Only the
 * last one saves (freezes the text, renders the PDF with the signature block
 * the server rebuilds, and attaches it to the rental under "Contrato").
 */
export function ContractEditor({
  rentalId,
  templateId,
  draft: initialDraft,
  aiEnabled,
  cancelTo,
  onSaved,
}: ContractEditorProps) {
  const preview = useContractPreview();
  const create = useCreateContract(rentalId);
  const idempotency = useIdempotencyKey();
  const draft = useContractDraftSync(initialDraft);
  const [error, setError] = useState<string | null>(null);

  const save = async (html: string) => {
    setError(null);
    try {
      await draft.flush();
    } catch (failure) {
      setError(toApiError(failure).message);
      return;
    }
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
      initialHtml={initialDraft.html}
      draft={draft}
      aiEnabled={aiEnabled}
      intro="Revise o contrato abaixo. Você pode ajustar o texto antes de gerar o PDF; o que estiver aqui fica congelado no documento. As assinaturas entram no fim do PDF."
      label="Texto do contrato"
      cancelTo={cancelTo}
      chat={{ mode: "contract", suggestions: CONTRACT_SUGGESTIONS, rentalId }}
      onPreview={(html) => preview.mutate({ rentalId, templateId, html })}
      previewing={preview.isPending}
      onSave={(html) => void save(html)}
      saving={create.isPending}
      error={error}
    />
  );
}
