import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toApiError } from "@/helpers/api-error";
import { aiChatEvents, aiGuide } from "@/hooks/ui/useAiGuide";
import { aiService } from "@/services/api/gestao/ai.service";
import type { AiProposalForm } from "@/types/ai";

/** One field the assistant fills: where it is, and how to put the value in. */
export type AiFillStep = {
  /** The field's label on the form (finds it on the screen). */
  label: string;
  /** Where the value came from ("da CNH anexada"); absent = a generic note. */
  origin?: string;
  /** The value as it will show in the field ("(21) 99876-5432"). */
  value?: string;
  apply: () => void;
};

/** What the chat hands to a form ("Preencher na tela"), via the router state. */
export type AiFillRequest = { actionId: string; form: AiProposalForm };

/** "(21) 99876-5432 · origem: você disse no chat". */
function fillText(step: AiFillStep) {
  const origin = step.origin?.trim();
  if (step.value)
    return origin ? `${step.value} · origem: ${origin}` : step.value;
  return origin
    ? `Origem: ${origin}.`
    : "Preenchido com o que a IA leu ou você disse no chat.";
}

const PAUSE_BEFORE = 900;
const PAUSE_AFTER = 450;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * "Preencher na tela": when the chat opens this form with a proposal, the
 * fields fill one by one, each highlighted with where its value came from —
 * the person learns the form while watching — and it ends pointing at the
 * save button. Saving through the form tells the chat (the proposal is
 * fulfilled there and can't be confirmed again).
 */
export function useAiFormFill(
  kind: AiProposalForm["kind"],
  plan: (form: AiProposalForm) => AiFillStep[],
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [request] = useState<AiFillRequest | null>(() => {
    const state = location.state as { aiFill?: AiFillRequest } | null;
    return state?.aiFill?.form.kind === kind ? state.aiFill : null;
  });
  const planRef = useRef(plan);
  planRef.current = plan;

  useEffect(() => {
    if (!request) return;
    // A refresh mustn't replay it.
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
    let stopped = false;
    let rushing = false;
    const steps = planRef.current(request.form);

    const run = async () => {
      await wait(600);
      for (const [index, step] of steps.entries()) {
        if (stopped) return;
        if (!rushing) {
          aiGuide.show(
            {
              target: { label: step.label },
              title: step.label,
              text: fillText(step),
              step: { index: index + 1, total: steps.length },
              next: { label: "Preencher tudo", run: () => (rushing = true) },
            },
            () => (stopped = true),
          );
          await wait(PAUSE_BEFORE);
        }
        if (stopped) return;
        step.apply();
        if (!rushing) await wait(PAUSE_AFTER);
      }
      if (stopped) return;
      aiGuide.show({
        target: { selector: "form button[type=submit]" },
        title: "Confira e salve aqui",
        text: "Revise os campos. Salvando por aqui o cadastro fica feito e o chat fica sabendo; se preferir, confirme no chat.",
      });
    };
    void run();
    return () => {
      stopped = true;
    };
    // Once, with the request it came with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  /** Call after the form saved: the chat's proposal is done (by the screen). */
  const fulfill = async (recordId: string) => {
    if (!request) return;
    aiGuide.clear();
    try {
      const done = await aiService.fulfillAction(request.actionId, recordId);
      aiChatEvents.emit({
        type: "fulfilled",
        actionId: request.actionId,
        summary: done.summary,
        result: done.result,
      });
    } catch (failure) {
      // The record exists anyway; the proposal may have been decided in the chat.
      console.warn("[ai] fulfill", toApiError(failure).message);
    }
  };

  return { active: Boolean(request), fulfill };
}
