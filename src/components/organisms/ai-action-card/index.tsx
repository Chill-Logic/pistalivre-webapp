import { Check, CircleSlash, ShieldCheck } from "lucide-react";
import { useState } from "react";
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
import { useAiChatAction } from "@/hooks/api/gestao/ai/useAi";
import type { AiChatAction } from "@/types/ai";

type Decision = "pending" | "done" | "cancelled";

/** The server sends ready labels ("Veículo desejado"); values as plain text. */
const fieldValue = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value);

/**
 * A write the agent proposed: what would change, and the person decides.
 * Nothing happens until "Confirmar" (the server runs it once, if the tool is
 * still granted and it hasn't expired).
 */
export function AiActionCard({ action }: { action: AiChatAction }) {
  const { confirm, cancel } = useAiChatAction();
  const [decision, setDecision] = useState<Decision>("pending");
  const [error, setError] = useState<string | null>(null);
  const busy = confirm.isPending || cancel.isPending;
  const fields = Object.entries(action.details).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  const decide = (kind: "confirm" | "cancel") => {
    setError(null);
    const mutation = kind === "confirm" ? confirm : cancel;
    mutation.mutate(action.id, {
      onSuccess: () => setDecision(kind === "confirm" ? "done" : "cancelled"),
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
        <Box className="flex justify-end gap-2 pt-1">
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
          {decision === "done" ? (
            <Check className="size-3 text-success" aria-hidden />
          ) : (
            <CircleSlash className="size-3" aria-hidden />
          )}
          {decision === "done" ? "Feito" : "Cancelada: nada foi alterado"}
        </Text>
      )}
    </Box>
  );
}
