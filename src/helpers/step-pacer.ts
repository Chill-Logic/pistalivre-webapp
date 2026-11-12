import type { AiChatLiveStep } from "@/types/ai";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Shows the chat's live steps at a human pace: each tool stays "running"
 * ("Vasculhando as locações…") at least a little while, a random bit each
 * time, even when the server answered in milliseconds — the person sees the
 * work being done. Only the screen waits (never the server), and the extra
 * time of one answer is capped.
 */
export function createStepPacer(
  apply: (step: AiChatLiveStep) => void,
  { min = 800, jitter = 500, maxExtra = 4_000 } = {},
) {
  let chain = Promise.resolve();
  let extra = 0;
  const shownAt = new Map<string, number>();
  return {
    push(step: AiChatLiveStep) {
      chain = chain.then(async () => {
        if (step.status === "running") {
          shownAt.set(step.id, Date.now());
        } else {
          const since = Date.now() - (shownAt.get(step.id) ?? Date.now());
          const hold = Math.min(
            min + Math.random() * jitter - since,
            maxExtra - extra,
          );
          if (hold > 0) {
            extra += hold;
            await wait(hold);
          }
        }
        apply(step);
      });
    },
    /** Resolves once every step received so far has been shown. */
    drained: () => chain,
  };
}
