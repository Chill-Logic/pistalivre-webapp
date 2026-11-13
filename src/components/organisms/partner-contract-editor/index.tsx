import { PenLine, Send } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { toApiError } from "@/helpers/api-error";
import type { ContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import {
  usePartnerContractDocumentPreview,
  useSendPartnerProposal,
  useSendPartnerToSignature,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { PartnerContract, PartnerProposalVersion } from "@/types/partner";

type PartnerContractEditorProps = {
  contract: PartnerContract;
  /** The contract's living text, synced with the server (the page owns it: the chat beside edits it too). */
  draft: ContractDraftSync;
  aiEnabled: boolean;
  cancelTo: string;
  onSent: (version: PartnerProposalVersion) => void;
  /** Sent straight to signature: the signature request to finish (company signers). */
  onSentToSignature: (signatureRequestId: string) => void;
};

/**
 * The partner contract's text as a LIVING DRAFT (autosave, live reload when
 * the Livrinho or an MCP client changes it, undo). It ends only when someone
 * clicks "Enviar para revisão do parceiro" (a proposal the partner accepts in
 * app.parceiro) or "Enviar para assinatura" (closed outside: straight to
 * Clicksign, the partner still signs). The chat lives beside it, on the page.
 */
export function PartnerContractEditor({
  contract,
  draft,
  aiEnabled,
  cancelTo,
  onSent,
  onSentToSignature,
}: PartnerContractEditorProps) {
  const contractId = contract.id;
  const preview = usePartnerContractDocumentPreview(contractId);
  const send = useSendPartnerProposal(contractId);
  const toSignature = useSendPartnerToSignature(contractId);
  const [error, setError] = useState<string | null>(null);
  const [confirmSignature, setConfirmSignature] = useState(false);

  /** Whatever is typed goes to the server first: the server freezes ITS text. */
  const flushed = async () => {
    setError(null);
    try {
      await draft.flush();
      return true;
    } catch (failure) {
      setError(toApiError(failure).message);
      return false;
    }
  };

  const sendForReview = async (html: string) => {
    if (!(await flushed())) return;
    send.mutate(html, {
      onSuccess: onSent,
      onError: (failure) => setError(toApiError(failure).message),
    });
  };

  const sendToSignature = async () => {
    setConfirmSignature(false);
    if (!(await flushed())) return;
    toSignature.mutate(undefined, {
      onSuccess: ({ signatureRequestId }) => onSentToSignature(signatureRequestId),
      onError: (failure) => setError(toApiError(failure).message),
    });
  };

  return (
    <>
      <AiDocumentEditor
        initialHtml={draft.html}
        draft={draft}
        aiEnabled={aiEnabled}
        intro="Rascunho vivo: converse com o Livrinho ao lado (cole o combinado, peça ajustes) que ele atualiza o texto, os termos e a calculadora na hora. Nada sai daqui até alguém enviar: para a revisão do parceiro (ele aceita ou recusa na área dele) ou direto para assinatura, quando tudo já foi combinado por fora."
        label="Texto do contrato"
        cancelTo={cancelTo}
        onPreview={(html) => preview.mutate(html)}
        previewing={preview.isPending}
        onSave={(html) => void sendForReview(html)}
        saving={send.isPending}
        saveLabel="Enviar para revisão do parceiro"
        savingLabel="Enviando…"
        saveIcon={<Send />}
        extraAction={{
          label: "Enviar para assinatura",
          icon: <PenLine />,
          onClick: () => setConfirmSignature(true),
          busy: toSignature.isPending,
        }}
        error={error}
      />
      <ConfirmDialog
        open={confirmSignature}
        onOpenChange={setConfirmSignature}
        title="Enviar direto para assinatura?"
        description="O combinado já foi fechado por fora: esta versão fica registrada como aceita pela locadora, sem a revisão do parceiro na área dele, e o pedido de assinatura abre com ele como signatário. Depois disso o texto e os termos não mudam mais."
        confirmLabel="Enviar para assinatura"
        onConfirm={() => void sendToSignature()}
      />
    </>
  );
}
