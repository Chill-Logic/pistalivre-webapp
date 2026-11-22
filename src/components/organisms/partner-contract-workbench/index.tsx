import { useCallback, useRef, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import type { CalculatorTerms } from "@/components/organisms/partner-contract-calculator";
import { PartnerContractAddTermDialog } from "@/components/organisms/partner-contract-add-term-dialog";
import { PartnerContractEditor } from "@/components/organisms/partner-contract-editor";
import { PartnerContractForm } from "@/components/organisms/partner-contract-form";
import { PartnerContractLiveCalculator } from "@/components/organisms/partner-contract-live-calculator";
import {
  PartnerContractTermPanel,
  type PartnerTermDraftHandle,
} from "@/components/organisms/partner-contract-term-panel";
import {
  PartnerContractWorkspace,
  type PartnerContractTab,
} from "@/components/templates/partner-contract-workspace";
import { routeTo } from "@/constants/routes";
import { PARTNER_CONTRACT_SUGGESTIONS, partnerChatScope } from "@/helpers/partner-contract-chat";
import { contractInputOf, instrumentShortLabel, instrumentTabLabel } from "@/helpers/partner";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { useContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import { usePersistedAiChat } from "@/hooks/ui/usePersistedAiChat";
import type { ContractDraftState } from "@/types/contract";
import type {
  PartnerContract,
  PartnerContractInstruments,
  PartnerContractTextDraft,
} from "@/types/partner";

const TAB_PARAM = "aba";
/** `?incluir=1` opens the "Incluir termo" dialog (the document card links to it). */
const ADD_PARAM = "incluir";
/** The old address of the contribution term's tab (the assistant's links still use it). */
const CONTRIBUTION_TAB = "termo-de-aporte";
const TERM_PREFIX = "termo-";

type PartnerContractWorkbenchProps = {
  contract: PartnerContract;
  textDraft: PartnerContractTextDraft;
  /** The documents that go with the contract (null = the list failed: no term tabs). */
  instruments: PartnerContractInstruments | null;
  header: ReactNode;
  notices?: ReactNode;
};

type ActiveTermText = { instrumentId: string; draftId: string; html: string };

/**
 * A saved partner contract, worked on as a LIVING DRAFT: "Termos" (the form
 * and the calculator), "Contrato" (the text) and one tab per document that
 * goes with it (the contribution term, any "Outro termo"), with the Livrinho
 * beside them — one conversation that edits the terms, the calculator and the
 * open text, until someone sends it (to the partner's review or straight to
 * signature; the terms go along).
 */
export function PartnerContractWorkbench({
  contract,
  textDraft,
  instruments,
  header,
  notices,
}: PartnerContractWorkbenchProps) {
  const draft = useContractDraftSync(textDraft.draft);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const items = instruments?.items ?? [];

  const asked = params.get(TAB_PARAM);
  const contribution = items.find((item) => item.kind === "CONTRIBUTION_TERM");
  const askedTerm =
    asked === CONTRIBUTION_TAB
      ? contribution
      : asked?.startsWith(TERM_PREFIX)
        ? items.find((item) => item.id === asked.slice(TERM_PREFIX.length))
        : undefined;
  const tab: PartnerContractTab = askedTerm
    ? `termo-${askedTerm.id}`
    : asked === "termos"
      ? "termos"
      : "contrato";
  const activeTermId = askedTerm?.id ?? null;

  /** One URL change for everything (two in a row would drop the first). */
  const updateParams = (changes: Record<string, string | null>) =>
    setParams((current) => {
      const copy = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) copy.delete(key);
        else copy.set(key, value);
      }
      return copy;
    }, { replace: true });
  const setTab = (next: PartnerContractTab) => updateParams({ [TAB_PARAM]: next });
  const canAdd = Boolean(instruments && instruments.available.length > 0);
  const adding = canAdd && params.get(ADD_PARAM) === "1";

  // Each term's living text lives in its own tab; the page keeps a handle of
  // each (sending flushes them all; the chat's answers go to theirs).
  const handles = useRef(new Map<string, PartnerTermDraftHandle>());
  const register = useCallback(
    (instrumentId: string, handle: PartnerTermDraftHandle | null) => {
      if (handle) handles.current.set(instrumentId, handle);
      else handles.current.delete(instrumentId);
    },
    [],
  );
  const [activeText, setActiveText] = useState<ActiveTermText | null>(null);
  const onActiveHtml = useCallback(
    (instrumentId: string, draftId: string, html: string) =>
      setActiveText({ instrumentId, draftId, html }),
    [],
  );
  const flushTerms = () =>
    Promise.all([...handles.current.values()].map((handle) => handle.flush()));

  const conversation = usePersistedAiChat(partnerChatScope(contract.id));
  const chatAvailable = useAiChatAvailable() && textDraft.aiEnabled;
  const [terms, setTerms] = useState<CalculatorTerms | null>(null);
  const contractUrl = routeTo.partnerContract(contract.id);
  // The Livrinho (or another screen) changed the terms: the form starts over from them.
  const termsKey = JSON.stringify(contractInputOf(contract));

  // The chat edits the text that is open: the term on its tab (once loaded), the contract otherwise.
  const termOpen =
    activeTermId && activeText?.instrumentId === activeTermId ? activeText : null;
  const open = termOpen
    ? {
        id: termOpen.draftId,
        html: termOpen.html,
        flush: () => {
          const handle = handles.current.get(termOpen.instrumentId);
          return handle ? handle.flush() : draft.flush();
        },
        replace: (html: string) => handles.current.get(termOpen.instrumentId)?.replace(html),
      }
    : draft;
  /** The answer's text goes to the document it belongs to (by its draft). */
  const applyDraft = (state: ContractDraftState) => {
    if (state.id === draft.id) return draft.apply(state);
    const term = [...handles.current.values()].find((handle) => handle.id === state.id);
    // A term the chat just included: its tab opens it from the server.
    term?.apply(state);
  };

  return (
    <>
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
            // What is typed in every term goes to the server before the contract is sent.
            alsoFlush={flushTerms}
            termCount={items.length}
            onSent={() => navigate(contractUrl, { replace: true })}
            onSentToSignature={(signatureId) => navigate(routeTo.signature(signatureId), { replace: true })}
          />
        }
        terms={items.map((instrument) => ({
          value: `termo-${instrument.id}` as const,
          title: instrumentShortLabel(instrument.kind, instrument.title),
          fullTitle: instrument.title,
          shortTitle: instrumentTabLabel(instrument.kind, instrument.title),
          content: (
            <PartnerContractTermPanel
              contractId={contract.id}
              instrument={instrument}
              active={instrument.id === activeTermId}
              onRegister={register}
              onActiveHtml={onActiveHtml}
              onRemoved={() => setTab("contrato")}
              aiEnabled={textDraft.aiEnabled}
              cancelTo={contractUrl}
            />
          ),
        }))}
        addTerm={
          canAdd ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => updateParams({ [ADD_PARAM]: "1" })}
              aria-label="Incluir termo"
              title="Incluir termo"
              className="h-11 px-3 md:h-9"
            >
              <Plus />
              <Text inline size={null} className="hidden sm:inline">
                Incluir termo
              </Text>
            </Button>
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
              onDraft={applyDraft}
              conversation={conversation}
            />
          ) : undefined
        }
      />
      {instruments && canAdd && (
        <PartnerContractAddTermDialog
          contractId={contract.id}
          instruments={instruments}
          open={adding}
          onOpenChange={(next) => updateParams({ [ADD_PARAM]: next ? "1" : null })}
          onAdded={(instrument) =>
            updateParams({ [ADD_PARAM]: null, [TAB_PARAM]: `termo-${instrument.id}` })
          }
        />
      )}
    </>
  );
}
