import { Send } from "lucide-react";
import { useState } from "react";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { toApiError } from "@/helpers/api-error";
import {
  usePartnerContractDocumentPreview,
  useSendPartnerProposal,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { PartnerProposalVersion } from "@/types/partner";

type PartnerContractEditorProps = {
  contractId: string;
  /** The base text merged by the server (GET …/document/draft). */
  initialHtml: string;
  aiEnabled: boolean;
  cancelTo: string;
  onSent: (version: PartnerProposalVersion) => void;
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
 * "Enviar proposta ao parceiro": the text, the terms and the vehicles freeze
 * as the next version (with its PDF), which the partner accepts or refuses.
 */
export function PartnerContractEditor({
  contractId,
  initialHtml,
  aiEnabled,
  cancelTo,
  onSent,
}: PartnerContractEditorProps) {
  const preview = usePartnerContractDocumentPreview(contractId);
  const send = useSendPartnerProposal(contractId);
  const [error, setError] = useState<string | null>(null);

  const save = (html: string) => {
    setError(null);
    send.mutate(html, {
      onSuccess: onSent,
      onError: (failure) => setError(toApiError(failure).message),
    });
  };

  return (
    <AiDocumentEditor
      initialHtml={initialHtml}
      aiEnabled={aiEnabled}
      intro="Revise o contrato do parceiro abaixo. Ao enviar, o texto, os termos e os veículos ficam congelados numa nova versão da proposta, que o parceiro aceita ou recusa na área dele. As assinaturas entram no fim do PDF."
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
      saving={send.isPending}
      saveLabel="Enviar proposta ao parceiro"
      savingLabel="Enviando proposta…"
      saveIcon={<Send />}
      error={error}
    />
  );
}
