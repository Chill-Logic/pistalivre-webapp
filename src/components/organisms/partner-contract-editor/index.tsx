import { useState } from "react";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { toApiError } from "@/helpers/api-error";
import {
  useGeneratePartnerContractDocument,
  usePartnerContractDocumentPreview,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";

type PartnerContractEditorProps = {
  contractId: string;
  /** The base text merged by the server (GET …/document/draft). */
  initialHtml: string;
  aiEnabled: boolean;
  cancelTo: string;
  onSaved: () => void;
};

/** Starting points offered by the assistant (it asks for what's missing). */
const PARTNER_CONTRACT_SUGGESTIONS = [
  "Incluir cláusula de seguro por conta da empresa",
  "Deixar a rescisão com aviso de 60 dias",
  "Explicar melhor como é apurado o faturamento",
  "Revisar a linguagem jurídica",
];

/**
 * The partner contract's text (investment or management, merged with its
 * terms and vehicles), with the AI assistant beside it → "Visualizar PDF" →
 * "Gerar PDF e salvar", which freezes it as the contract's PDF (the server
 * adds the signatures). Generating again keeps the old file.
 */
export function PartnerContractEditor({
  contractId,
  initialHtml,
  aiEnabled,
  cancelTo,
  onSaved,
}: PartnerContractEditorProps) {
  const preview = usePartnerContractDocumentPreview(contractId);
  const generate = useGeneratePartnerContractDocument(contractId);
  const [error, setError] = useState<string | null>(null);

  const save = (html: string) => {
    setError(null);
    generate.mutate(html, {
      onSuccess: () => onSaved(),
      onError: (failure) => setError(toApiError(failure).message),
    });
  };

  return (
    <AiDocumentEditor
      initialHtml={initialHtml}
      aiEnabled={aiEnabled}
      intro="Revise o contrato do parceiro abaixo. Ajuste o texto antes de gerar o PDF; o que estiver aqui fica congelado no documento. As assinaturas entram no fim do PDF."
      label="Texto do contrato"
      cancelTo={cancelTo}
      chat={{
        mode: "partner_contract",
        suggestions: PARTNER_CONTRACT_SUGGESTIONS,
        partnerContractId: contractId,
      }}
      onPreview={(html) => preview.mutate(html)}
      previewing={preview.isPending}
      onSave={save}
      saving={generate.isPending}
      error={error}
    />
  );
}
