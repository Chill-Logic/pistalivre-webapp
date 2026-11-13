import { useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/atoms/card";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import type { CalculatorTerms } from "@/components/organisms/partner-contract-calculator";
import { PartnerContractEditor } from "@/components/organisms/partner-contract-editor";
import { PartnerContractForm } from "@/components/organisms/partner-contract-form";
import { PartnerContractLiveCalculator } from "@/components/organisms/partner-contract-live-calculator";
import {
  PartnerContractWorkspace,
  type PartnerContractTab,
} from "@/components/templates/partner-contract-workspace";
import { routeTo } from "@/constants/routes";
import { PARTNER_CONTRACT_SUGGESTIONS, partnerChatScope } from "@/helpers/partner-contract-chat";
import { contractInputOf } from "@/helpers/partner";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { useContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import { usePersistedAiChat } from "@/hooks/ui/usePersistedAiChat";
import type { PartnerContract, PartnerContractTextDraft } from "@/types/partner";

const TAB_PARAM = "aba";

type PartnerContractWorkbenchProps = {
  contract: PartnerContract;
  textDraft: PartnerContractTextDraft;
  header: ReactNode;
  notices?: ReactNode;
};

/**
 * A saved partner contract, worked on as a LIVING DRAFT: "Termos" (the form
 * and the calculator) and "Contrato" (the text), with the Livrinho beside both
 * — one conversation that edits the terms, the calculator and the text, until
 * someone sends it (to the partner's review or straight to signature).
 */
export function PartnerContractWorkbench({ contract, textDraft, header, notices }: PartnerContractWorkbenchProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab: PartnerContractTab = params.get(TAB_PARAM) === "termos" ? "termos" : "contrato";
  const setTab = (next: PartnerContractTab) =>
    setParams((current) => {
      const copy = new URLSearchParams(current);
      copy.set(TAB_PARAM, next);
      return copy;
    }, { replace: true });

  const draft = useContractDraftSync(textDraft.draft);
  const conversation = usePersistedAiChat(partnerChatScope(contract.id));
  const chatAvailable = useAiChatAvailable() && textDraft.aiEnabled;
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const contractUrl = routeTo.partnerContract(contract.id);
  // The Livrinho (or another screen) changed the terms: the form starts over from them.
  const termsKey = JSON.stringify(contractInputOf(contract));

  return (
    <PartnerContractWorkspace
      header={header}
      notices={notices}
      tab={tab}
      onTabChange={setTab}
      form={
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <PartnerContractForm
              key={termsKey}
              partnerId={contract.partnerId}
              contract={contract}
              onTermsChange={(values) => setTerms(values as CalculatorTerms)}
              onCancel={() => navigate(contractUrl)}
              onDone={() => toast.success("Termos salvos. Peça ao Livrinho para acertar a cláusula no texto, se mudou algo.")}
            />
          </CardContent>
        </Card>
      }
      calculator={<PartnerContractLiveCalculator contract={contract} terms={terms} />}
      contract={
        <PartnerContractEditor
          contract={contract}
          draft={draft}
          aiEnabled={textDraft.aiEnabled}
          cancelTo={contractUrl}
          onSent={() => navigate(contractUrl, { replace: true })}
          onSentToSignature={(signatureId) => navigate(routeTo.signature(signatureId), { replace: true })}
        />
      }
      chat={
        chatAvailable ? (
          <AiChatDock
            mode="partner_contract"
            suggestions={PARTNER_CONTRACT_SUGGESTIONS}
            partnerContractId={contract.id}
            html={draft.html}
            onApply={draft.replace}
            prepare={draft.flush}
            draftId={draft.id}
            onDraft={draft.apply}
            conversation={conversation}
          />
        ) : undefined
      }
    />
  );
}
