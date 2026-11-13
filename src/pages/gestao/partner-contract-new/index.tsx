import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import {
  PartnerContractCalculator,
  type CalculatorFill,
  type CalculatorTerms,
} from "@/components/organisms/partner-contract-calculator";
import {
  PartnerContractForm,
  PartnerContractFormSkeleton,
} from "@/components/organisms/partner-contract-form";
import { toContractInput, type ContractFormValues } from "@/components/organisms/partner-contract-form/schema";
import { PartnerContractTextPreview } from "@/components/organisms/partner-contract-text-preview";
import { QueryError } from "@/components/organisms/query-error";
import {
  PartnerContractWorkspace,
  type PartnerContractTab,
} from "@/components/templates/partner-contract-workspace";
import { ROUTES, routeTo } from "@/constants/routes";
import { moveAiChat } from "@/helpers/ai-chat-storage";
import { fulfilledEntry } from "@/helpers/ai-guide";
import {
  PARTNER_CONTRACT_SUGGESTIONS,
  createdPartnerContractId,
  newPartnerContractChatScope,
  partnerChatScope,
} from "@/helpers/partner-contract-chat";
import { useMe } from "@/hooks/api/comum/session/useMe";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { usePartner, usePartnerContractTextPreview } from "@/hooks/api/gestao/partners/usePartners";
import { aiChatEvents } from "@/hooks/ui/useAiGuide";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { usePersistedAiChat } from "@/hooks/ui/usePersistedAiChat";

const TAB_PARAM = "aba";
/** The text preview follows the form after a pause in the typing. */
const PREVIEW_DEBOUNCE_MS = 600;

/**
 * "Novo contrato" of a partner, in two tabs with the Livrinho beside both:
 * "Termos" (the form + the calculator that answers "quanto o parceiro
 * recebe?") and "Contrato" (the text those terms produce, read only until
 * saved). Created — by the form or by the Livrinho — it opens as the living
 * draft, and the conversation goes along.
 */
export function PartnerContractNewPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const partner = usePartner(id);
  const me = useMe();
  const chatAvailable = useAiChatAvailable();
  const tab: PartnerContractTab = params.get(TAB_PARAM) === "contrato" ? "contrato" : "termos";
  const setTab = (next: PartnerContractTab) =>
    setParams((current) => {
      const copy = new URLSearchParams(current);
      copy.set(TAB_PARAM, next);
      return copy;
    }, { replace: true });

  const [values, setValues] = useState<ContractFormValues | null>(null);
  // Livrinho's scenario ("Preencher na tela"): the calculator takes it as is.
  const [calculatorFill, setCalculatorFill] = useState<CalculatorFill | null>(null);
  const back = partner.data ? routeTo.partner(id) : ROUTES.partners;

  // The text of the terms typed so far (only while the tab is open).
  const input = useMemo(() => (values ? toContractInput(values) : null), [values]);
  const debouncedInput = useDebouncedValue(input, PREVIEW_DEBOUNCE_MS);
  const preview = usePartnerContractTextPreview(id, debouncedInput, tab === "contrato");

  // The conversation of this "Novo contrato" (survives F5); it goes with the contract.
  const chatScope = newPartnerContractChatScope(id);
  const [entries, setEntries] = usePersistedAiChat(chatScope);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const openCreated = (contractId: string) => {
    // A beat for the chat to record "Feito" before it moves with the contract.
    setTimeout(() => {
      if (me.data) moveAiChat(me.data.id, chatScope, partnerChatScope(contractId), entriesRef.current);
      navigate(`${routeTo.partnerContractDocument(contractId)}?${TAB_PARAM}=contrato`, { replace: true });
    }, 50);
  };
  const openCreatedRef = useRef(openCreated);
  openCreatedRef.current = openCreated;

  useEffect(
    () =>
      aiChatEvents.subscribe((event) => {
        // A proposal saved through the form ("Preencher na tela"): recorded in this chat.
        if (event.type === "fulfilled") setEntries((current) => [...current, fulfilledEntry(event)]);
        // The Livrinho created the contract (confirmed in the chat): open it.
        const created = event.type === "confirmed" ? createdPartnerContractId(event.result) : null;
        if (created) openCreatedRef.current(created);
      }),
    [setEntries],
  );

  return (
    <PartnerContractWorkspace
      header={
        <Box className="space-y-2">
          <BackLink to={back} label={partner.data?.name ?? "Parceiro"} />
          <PageHeader title="Novo contrato" />
        </Box>
      }
      tab={tab}
      onTabChange={setTab}
      form={
        partner.isPending ? (
          <SkeletonRegion label="Carregando o parceiro…">
            <PartnerContractFormSkeleton />
          </SkeletonRegion>
        ) : partner.isError ? (
          <QueryError error={partner.error} onRetry={() => partner.refetch()} />
        ) : (
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <PartnerContractForm
                partnerId={id}
                onTermsChange={setValues}
                onCalculatorFill={setCalculatorFill}
                onCancel={() => navigate(back)}
                onDone={(contract) => openCreated(contract.id)}
              />
            </CardContent>
          </Card>
        )
      }
      calculator={
        <PartnerContractCalculator terms={values as CalculatorTerms | null} fill={calculatorFill} />
      }
      contract={
        <PartnerContractTextPreview
          html={preview.data?.html}
          missing={preview.data?.missing ?? []}
          loading={!preview.data}
          refreshing={preview.isFetching}
          onEditTerms={() => setTab("termos")}
        />
      }
      chat={
        chatAvailable ? (
          <AiChatDock
            mode="general"
            suggestions={PARTNER_CONTRACT_SUGGESTIONS}
            page={pathname}
            conversation={[entries, setEntries]}
          />
        ) : undefined
      }
    />
  );
}
