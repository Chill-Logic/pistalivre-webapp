import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/atoms/sheet";
import {
  AiChatPanel,
  type ChatEntry,
} from "@/components/organisms/ai-chat-panel";
import { fulfilledEntry } from "@/helpers/ai-guide";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { useAiDockPresent } from "@/hooks/ui/useAiDockPresence";
import { aiChatEvents, useAiGuideSpot } from "@/hooks/ui/useAiGuide";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { cn } from "@/utils/cn";

/** Starting points (4 of them, at random, each time): what the assistant does outside an editor. */
const GENERAL_SUGGESTIONS = [
  "Cadastrar cliente e locação pelos documentos",
  "Quem está com o aluguel atrasado?",
  "Quais motos estão disponíveis?",
  "Ajustar o contrato de uma locação",
  "Quanto entrou no caixa este mês?",
  "Quais cobranças vencem esta semana?",
  "Quem mais deve para a gente?",
  "Quais motos estão em manutenção?",
  "Tem vistoria atrasada?",
  "Como está o funil de leads?",
  "Quais locações começaram este mês?",
  "Qual o resumo financeiro do mês?",
  "Quais contas da empresa vencem este mês?",
  "Guardar a CNH de um cliente",
  "Qual o telefone e o e-mail da empresa?",
  "Quanto a IA custou este mês?",
];

/**
 * The AI assistant on every management screen. On the desktop it FLOATS: a
 * window in the corner, over the page but not blocking it (no overlay — the
 * person keeps using the screen while talking). On the phone it's a bottom
 * sheet. It knows the screen the person is on, takes photos and PDFs (paste,
 * drop, clip) and keeps the conversation while closed. Hidden when the AI
 * isn't available to the person, and while an editor shows its own assistant.
 */
export function AiAssistantLauncher() {
  const available = useAiChatAvailable();
  const docked = useAiDockPresent();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  // While the guide points at the screen, the window steps aside (it would
  // cover the very field being shown) and comes back when it ends.
  const guiding = useAiGuideSpot() !== null;
  const conversation = useState<ChatEntry[]>([]);
  const setEntries = conversation[1];

  // A proposal saved through its form: recorded even with the chat closed.
  useEffect(
    () =>
      aiChatEvents.subscribe((event) => {
        if (event.type === "fulfilled") {
          setEntries((current) => [...current, fulfilledEntry(event)]);
        }
      }),
    [setEntries],
  );

  // Esc closes the floating window (the sheet handles its own).
  useEffect(() => {
    if (!open || !isDesktop) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, isDesktop]);

  if (!available || docked) return null;

  const panel = (
    <AiChatPanel
      mode="general"
      suggestions={GENERAL_SUGGESTIONS}
      page={pathname}
      conversation={conversation}
      onClose={isDesktop ? () => setOpen(false) : undefined}
      // The phone's sheet covers the screen: it closes to show the way.
      onNavigate={isDesktop ? undefined : () => setOpen(false)}
      className="h-full"
    />
  );

  const launcher = (
    <Button
      type="button"
      size="icon"
      aria-label={open ? "Fechar o Livrinho" : "Livrinho, o assistente de IA"}
      aria-expanded={open}
      title="Livrinho, o assistente de IA"
      onClick={() => setOpen((value) => !value)}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 size-12 rounded-full shadow-lg md:bottom-6 md:right-6"
    >
      {open && isDesktop ? (
        <X className="size-5" />
      ) : (
        <Sparkles className="size-5" />
      )}
    </Button>
  );

  if (isDesktop) {
    return (
      <>
        {launcher}
        {open && (
          <Card
            role="dialog"
            aria-label="Livrinho, o assistente de IA"
            className={cn(
              "fixed bottom-24 right-6 z-40 flex h-[min(640px,calc(100dvh-8rem))] w-[400px] flex-col overflow-hidden rounded-2xl shadow-2xl",
              guiding && "hidden",
              "origin-bottom-right duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 motion-reduce:animate-none",
            )}
          >
            {panel}
          </Card>
        )}
      </>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {launcher}
      <SheetContent
        side="bottom"
        className="flex h-[85dvh] flex-col p-0 pb-safe-b"
      >
        <SheetTitle className="sr-only">
          Livrinho, o assistente de IA
        </SheetTitle>
        <SheetDescription className="sr-only">
          Pergunte sobre o sistema ou envie documentos para cadastrar.
        </SheetDescription>
        {panel}
      </SheetContent>
    </Sheet>
  );
}
