import {
  Check,
  CircleSlash,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { toApiError } from "@/helpers/api-error";
import { ROUTES } from "@/constants/routes";
import { useAiChatAction } from "@/hooks/api/gestao/ai/useAi";
import { aiChatEvents } from "@/hooks/ui/useAiGuide";
import type { AiChatAction } from "@/types/ai";

type Decision = "pending" | "done" | "cancelled" | "screen";

/** The system's form for each proposal kind ("Preencher na tela"). */
const FORM_ROUTE = {
  customer: ROUTES.customerNew,
  rental: ROUTES.rentalNew,
} as const;

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
    navigate(FORM_ROUTE[action.form.kind], {
      state: { aiFill: { actionId: action.id, form: action.form } },
    });
  };
  const [error, setError] = useState<string | null>(null);
  const busy = confirm.isPending || cancel.isPending;
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

  return (
    <Box className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <Text size="sm" weight="medium" className="flex items-center gap-1.5">
        <ShieldCheck className="size-4 text-primary" aria-hidden />
        {action.title}
      </Text>
      <Text size="sm">{action.summary}</Text>
      {fields.length > 0 && (
        <DescriptionList className="space-y-1">
          {fields.map(([key, value]) => (
            <Box key={key}>
              <DescriptionTerm>{key}</DescriptionTerm>
              <DescriptionDetails>{fieldValue(value)}</DescriptionDetails>
            </Box>
          ))}
        </DescriptionList>
      )}
      {error && <Alert>{error}</Alert>}
      {decision === "pending" ? (
        <Box className="flex flex-wrap justify-end gap-2 pt-1">
          {action.form && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-auto"
              title="Abre o formulário do sistema e preenche campo por campo, mostrando de onde veio cada dado"
              onClick={fillOnScreen}
              disabled={busy}
            >
              <MousePointerClick />
              Preencher na tela
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => decide("cancel")}
            disabled={busy}
          >
            {cancel.isPending && <Spinner />}
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => decide("confirm")}
            disabled={busy}
          >
            {confirm.isPending && (
              <Spinner className="text-primary-foreground" />
            )}
            Confirmar
          </Button>
        </Box>
      ) : (
        <Text
          size="xs"
          tone="muted"
          className="flex items-center gap-1.5 border-t pt-2"
        >
          {decision === "done" || decision === "screen" ? (
            <Check className="size-3 text-success" aria-hidden />
          ) : (
            <CircleSlash className="size-3" aria-hidden />
          )}
          {decision === "done"
            ? "Feito"
            : decision === "screen"
              ? "Feito pela tela"
              : "Cancelada: nada foi alterado"}
        </Text>
      )}
    </Box>
  );
}
