import { useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/atoms/card";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import type { CalculatorTerms } from "@/components/organisms/partner-contract-calculator";
import { PartnerContractEditor } from "@/components/organisms/partner-contract-editor";
import { PartnerContractForm } from "@/components/organisms/partner-contract-form";
import { PartnerContractLiveCalculator } from "@/components/organisms/partner-contract-live-calculator";
import { PartnerContractTermPanel } from "@/components/organisms/partner-contract-term-panel";
import {
  PartnerContractWorkspace,
  type PartnerContractTab,
} from "@/components/templates/partner-contract-workspace";
import { routeTo } from "@/constants/routes";
import { PARTNER_CONTRACT_SUGGESTIONS, partnerChatScope } from "@/helpers/partner-contract-chat";
import { contractInputOf } from "@/helpers/partner";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import {
  useContractDraftSync,
  type ContractDraftSync,
} from "@/hooks/api/gestao/contracts/useContractDraftSync";
import { usePersistedAiChat } from "@/hooks/ui/usePersistedAiChat";
import type { ContractDraftState } from "@/types/contract";
import type {
  PartnerContract,
  PartnerContractInstrument,
  PartnerContractTextDraft,
} from "@/types/partner";

const TAB_PARAM = "aba";
const TABS: PartnerContractTab[] = ["termos", "contrato", "termo-de-aporte"];

/** The contract's contribution term, when the contract can have one (investment). */
export type PartnerContractTermState = {
  /** Included in the contract (null = not yet: the tab offers to include it). */
  instrument: PartnerContractInstrument | null;
  /** Its living text, once opened. */
  textDraft: PartnerContractTextDraft | null;
};

type PartnerContractWorkbenchProps = {
  contract: PartnerContract;
  textDraft: PartnerContractTextDraft;
  /** Investment: the "Termo de aporte" tab (absent = no third tab). */
  term?: PartnerContractTermState;
  header: ReactNode;
  notices?: ReactNode;
};

/**
 * A saved partner contract, worked on as a LIVING DRAFT: "Termos" (the form
 * and the calculator), "Contrato" (the text) and, in an investment, "Termo de
 * aporte" (the other document that goes with it), with the Livrinho beside
 * them — one conversation that edits the terms, the calculator and the open
 * text, until someone sends it (to the partner's review or straight to
 * signature; the term goes along).
 */
export function PartnerContractWorkbench({ term, ...props }: PartnerContractWorkbenchProps) {
  const draft = useContractDraftSync(props.textDraft.draft);
  const termDraft = term?.textDraft?.draft;
  // The term's text keeps its own sync (keyed by its draft: removed and
  // included again = a new text).
  if (term && termDraft) {
    return (
      <TermDraftScope key={termDraft.id} initial={termDraft}>
        {(termSync) => (
          <WorkbenchBody {...props} draft={draft} term={term} termSync={termSync} />
        )}
      </TermDraftScope>
    );
  }
  return <WorkbenchBody {...props} draft={draft} term={term} termSync={null} />;
}

/** Keeps the term's living text in step with the server for what it renders. */
function TermDraftScope({
  initial,
  children,
}: {
  initial: ContractDraftState;
  children: (sync: ContractDraftSync) => ReactNode;
}) {
  const sync = useContractDraftSync(initial);
  return <>{children(sync)}</>;
}

function WorkbenchBody({
  contract,
  textDraft,
  header,
  notices,
  draft,
  term,
  termSync,
}: Omit<PartnerContractWorkbenchProps, "term"> & {
  draft: ContractDraftSync;
  term?: PartnerContractTermState;
  termSync: ContractDraftSync | null;
}) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const asked = params.get(TAB_PARAM) as PartnerContractTab | null;
  const tab: PartnerContractTab =
    asked && TABS.includes(asked) && (asked !== "termo-de-aporte" || term)
      ? asked
      : "contrato";
  const setTab = (next: PartnerContractTab) =>
    setParams((current) => {
      const copy = new URLSearchParams(current);
      copy.set(TAB_PARAM, next);
      return copy;
    }, { replace: true });

  const conversation = usePersistedAiChat(partnerChatScope(contract.id));
  const chatAvailable = useAiChatAvailable() && textDraft.aiEnabled;
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const contractUrl = routeTo.partnerContract(contract.id);
  // The Livrinho (or another screen) changed the terms: the form starts over from them.
  const termsKey = JSON.stringify(contractInputOf(contract));
  // The chat edits the text that is open: the term on its tab, the contract otherwise.
  const open = tab === "termo-de-aporte" && termSync ? termSync : draft;

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
          // What is typed in the term goes to the server before the contract is sent.
          alsoFlush={termSync ? termSync.flush : undefined}
          withTerm={Boolean(term?.instrument)}
          onSent={() => navigate(contractUrl, { replace: true })}
          onSentToSignature={(signatureId) => navigate(routeTo.signature(signatureId), { replace: true })}
        />
      }
      term={
        term ? (
          <PartnerContractTermPanel
            contractId={contract.id}
            instrument={term.instrument}
            draft={termSync}
            aiEnabled={term.textDraft?.aiEnabled ?? textDraft.aiEnabled}
            cancelTo={contractUrl}
          />
        ) : undefined
      }
      chat={
        chatAvailable ? (
          <AiChatDock
            mode="partner_contract"
            suggestions={PARTNER_CONTRACT_SUGGESTIONS}
            partnerContractId={contract.id}
            html={open.html}
            onApply={open.replace}
            prepare={open.flush}
            draftId={open.id}
            // The answer's text goes to the document it belongs to (by its draft).
            onDraft={(state) =>
              (state.id === termSync?.id ? termSync : draft).apply(state)
            }
            conversation={conversation}
          />
        ) : undefined
      }
    />
  );
}
