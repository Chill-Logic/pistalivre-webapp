import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import {
  ChoicePrompt,
  type ChoiceOption,
} from "@/components/molecules/choice-prompt";
import { toApiError } from "@/helpers/api-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { useAiChatAction } from "@/hooks/api/gestao/ai/useAi";
import { aiChatEvents } from "@/hooks/ui/useAiGuide";
import type { AiChatAction, AiProposalForm } from "@/types/ai";

type Decision = "pending" | "filling" | "done" | "cancelled" | "screen";

/** The system's form for each proposal kind ("Preencher na tela"). */
/** Where each proposal is filled on screen (the partner's contract depends on the partner). */
const FORM_ROUTE: Record<AiProposalForm["kind"], (form: AiProposalForm) => string> = {
  customer: () => ROUTES.customerNew,
  rental: () => ROUTES.rentalNew,
  partnerContract: (form) => routeTo.newPartnerContract(String(form.values.partnerId ?? "")),
};

/** The server sends ready labels ("Veículo desejado"); values as plain text. */
const fieldValue = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value);

/**
 * A write the agent proposed: what would change, and the person decides.
 * Nothing happens until "Confirmar" (the server runs it once, if the tool is
 * still granted and it hasn't expired).
 */
export function AiActionCard({
  action,
  onDone,
  onNavigate,
}: {
  action: AiChatAction;
  /** Confirmed and run: what it did (the chat tells the agent, e.g. the new ids). */
  onDone?: (outcome: { summary: string; result: unknown }) => void;
  /** Before leaving for the form (the phone closes the chat sheet). */
  onNavigate?: () => void;
}) {
  const { confirm, cancel } = useAiChatAction();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<Decision>("pending");

  // Saved through the form ("Preencher na tela"): no confirming twice.
  useEffect(
    () =>
      aiChatEvents.subscribe((event) => {
        if (event.type === "fulfilled" && event.actionId === action.id) {
          setDecision("screen");
        }
      }),
    [action.id],
  );

  const fillOnScreen = () => {
    if (!action.form) return;
    onNavigate?.();
    navigate(FORM_ROUTE[action.form.kind](action.form), {
      state: { aiFill: { actionId: action.id, form: action.form } },
    });
  };
  const [error, setError] = useState<string | null>(null);
  const fields = Object.entries(action.details).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  const decide = (kind: "confirm" | "cancel") => {
    setError(null);
    const mutation = kind === "confirm" ? confirm : cancel;
    mutation.mutate(action.id, {
      onSuccess: (data) => {
        setDecision(kind === "confirm" ? "done" : "cancelled");
        if (kind === "confirm" && data) {
          onDone?.({ summary: data.summary, result: data.result });
        }
      },
      onError: (failure) => setError(toApiError(failure).message),
    });
  };

  const details =
    fields.length > 0 ? (
      <DescriptionList className="space-y-1 rounded-lg border bg-card px-3 py-2">
        {fields.map(([key, value]) => (
          <Box key={key}>
            <DescriptionTerm>{key}</DescriptionTerm>
            <DescriptionDetails>{fieldValue(value)}</DescriptionDetails>
          </Box>
        ))}
      </DescriptionList>
    ) : null;

  const answered =
    decision === "done"
      ? "Você confirmou daqui: feito."
      : decision === "screen"
        ? "Você preencheu e salvou pela tela: feito."
        : decision === "cancelled"
          ? "Você cancelou: nada foi alterado."
          : undefined;

  const options: ChoiceOption[] = [
    ...(action.form
      ? [
          {
            label:
              decision === "filling"
                ? "Abrir o formulário de novo"
                : "Preencher na tela e eu salvo",
            hint: "Abre o formulário do sistema e preenche campo por campo, mostrando de onde veio cada dado.",
            primary: true,
            onSelect: () => {
              setDecision("filling");
              fillOnScreen();
            },
          },
        ]
      : []),
    {
      label: action.form ? "Confirmar daqui" : "Confirmar",
      hint: "Grava agora, sem abrir o formulário.",
      primary: !action.form,
      pending: confirm.isPending,
      onSelect: () => decide("confirm"),
    },
    {
      label: "Cancelar",
      hint: "Nada é gravado.",
      pending: cancel.isPending,
      onSelect: () => decide("cancel"),
    },
  ];

  return (
    <ChoicePrompt
      icon={<ShieldCheck className="size-5" />}
      title={action.summary}
      subtitle={action.title}
      question={
        decision === "filling"
          ? "O formulário está aberto: salve lá, ou decida daqui."
          : "Como você quer fazer?"
      }
      options={options}
      answered={answered}
      autoFocus
      error={error ? <Alert>{error}</Alert> : null}
    >
      {details}
    </ChoicePrompt>
  );
}
