import { PenLine, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { PartnerContractCalculator } from "@/components/organisms/partner-contract-calculator";
import {
  calculatorTermsOf,
  scenarioFillOf,
  scenarioKey,
} from "@/helpers/partner-calculator";
import { toApiError } from "@/helpers/api-error";
import { useContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import {
  usePartnerContractDocumentPreview,
  useSavePartnerCalculator,
  useSendPartnerProposal,
  useSendPartnerToSignature,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { ContractDraftState } from "@/types/contract";
import type {
  PartnerCalculatorScenario,
  PartnerContract,
  PartnerProposalVersion,
} from "@/types/partner";

type PartnerContractEditorProps = {
  contract: PartnerContract;
  /** The contract's living text (GET …/text-draft): editor, chat and MCP share it. */
  draft: ContractDraftState;
  aiEnabled: boolean;
  cancelTo: string;
  onSent: (version: PartnerProposalVersion) => void;
  /** Sent straight to signature: the signature request to finish (company signers). */
  onSentToSignature: (signatureRequestId: string) => void;
};

/** Starting points offered by the assistant (it asks for what's missing). */
const PARTNER_CONTRACT_SUGGESTIONS = [
  "Colar a conversa com o combinado e montar o contrato",
  "Incluir a reavaliação a cada 3 meses",
  "Deixar a rescisão com aviso de 30 dias",
  "Revisar a linguagem jurídica",
];

/** Saves the scenario after the person stops typing in the calculator. */
const SCENARIO_SAVE_MS = 800;

/**
 * The partner contract as a LIVING DRAFT: the text is saved on the server
 * (autosave + live reload when the assistant or an MCP client changes it),
 * the assistant beside it also adjusts the terms and the calculator, and the
 * calculator below the chat follows the contract. It ends only when someone
 * clicks "Enviar para revisão do parceiro" (a proposal the partner accepts in
 * app.parceiro) or "Enviar para assinatura" (closed outside: straight to
 * Clicksign, the partner still signs).
 */
export function PartnerContractEditor({
  contract,
  draft: initialDraft,
  aiEnabled,
  cancelTo,
  onSent,
  onSentToSignature,
}: PartnerContractEditorProps) {
  const contractId = contract.id;
  const preview = usePartnerContractDocumentPreview(contractId);
  const send = useSendPartnerProposal(contractId);
  const toSignature = useSendPartnerToSignature(contractId);
  const saveScenario = useSavePartnerCalculator(contractId);
  const draft = useContractDraftSync(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [confirmSignature, setConfirmSignature] = useState(false);

  // The person's calculator changes are saved on the contract (debounced): the
  // assistant reads the same scenario.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onScenarioChange = (scenario: PartnerCalculatorScenario) => {
    clearTimeout(timer.current);
    // The calculator just took what the server has (the assistant's change):
    // saving it back would only echo — and echo again on the next update.
    if (scenarioKey(scenario) === scenarioKey(contract.calculatorScenario)) return;
    timer.current = setTimeout(() => saveScenario.mutate(scenario), SCENARIO_SAVE_MS);
  };

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
        initialHtml={initialDraft.html}
        draft={draft}
        aiEnabled={aiEnabled}
        intro="Rascunho vivo: converse com o Livrinho ao lado (cole o combinado, peça ajustes) que ele atualiza o texto, os termos e a calculadora na hora. Nada sai daqui até alguém enviar: para a revisão do parceiro (ele aceita ou recusa na área dele) ou direto para assinatura, quando tudo já foi combinado por fora."
        label="Texto do contrato"
        cancelTo={cancelTo}
        chat={{
          mode: "partner_contract",
          suggestions: PARTNER_CONTRACT_SUGGESTIONS,
          partnerContractId: contractId,
        }}
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
        aside={
          <PartnerContractCalculator
            terms={calculatorTermsOf(contract)}
            fill={scenarioFillOf(contract.calculatorScenario)}
            onScenarioChange={onScenarioChange}
          />
        }
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
