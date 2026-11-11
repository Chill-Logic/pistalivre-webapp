import { ROUTES, routeTo } from "@/constants/routes";
import type { ChatEntry } from "@/components/organisms/ai-chat-panel";
import type { AiChatEvent, AiGuideSpot } from "@/hooks/ui/useAiGuide";
import type { AiUiSource } from "@/types/ai";

/** The page of a source (null = the app has no page for it). */
function routeOf(source: AiUiSource): string | null {
  switch (source.screen) {
    case "rental":
      return source.id ? routeTo.rental(source.id) : null;
    case "customer":
      return source.id ? routeTo.customer(source.id) : null;
    case "lead":
      return source.id ? routeTo.lead(source.id) : null;
    case "maintenance":
      return source.id ? routeTo.maintenance(source.id) : null;
    case "inspection":
      return source.id ? routeTo.inspection(source.id) : null;
    case "contract_draft":
      return source.id
        ? routeTo.newRentalContract(source.id, {
            templateId: source.params?.modelo,
          })
        : null;
    case "dashboard":
      return ROUTES.dashboard;
    case "finance":
      return ROUTES.finance;
    case "plans":
      return ROUTES.plans;
  }
}

/**
 * "Mostrar onde vi isso": each place the agent read becomes a stop of the
 * tour — its page, the section highlighted (or the page title when the
 * screen has no section for it), and why it matters.
 */
export function sourcesToTour(
  sources: AiUiSource[],
): Omit<AiGuideSpot, "step" | "next">[] {
  return sources.flatMap((source) => {
    const route = routeOf(source);
    if (!route) return [];
    return [
      {
        route,
        target: { anchor: source.section, selector: "main h1" },
        title: source.label,
        text: source.hint,
      },
    ];
  });
}

/** A proposal saved through its form: the conversation records it (and the agent learns the ids). */
export function fulfilledEntry(event: AiChatEvent): ChatEntry {
  return {
    role: "assistant",
    content: `Feito pela tela: ${event.summary}.`,
    note: `[A pessoa salvou pelo formulário do sistema. Resultado: ${JSON.stringify(event.result)}]`,
  };
}
