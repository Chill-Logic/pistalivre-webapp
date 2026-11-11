import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/atoms/button";
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
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { useAiDockPresent } from "@/hooks/ui/useAiDockPresence";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

/** Starting points: what the assistant does outside an editor. */
const GENERAL_SUGGESTIONS = [
  "Cadastrar cliente e locação pelos documentos",
  "Quem está com o aluguel atrasado?",
  "Quais motos estão disponíveis?",
  "Ajustar o contrato de uma locação",
];

/**
 * The AI assistant on every management screen: a floating button that opens
 * the chat (side panel on the desktop, bottom sheet on the phone). It knows
 * the screen the person is on, takes photos and PDFs (paste, drop, clip) and
 * keeps the conversation while closed. Hidden when the AI isn't available to
 * the person, and while an editor shows its own assistant.
 */
export function AiAssistantLauncher() {
  const available = useAiChatAvailable();
  const docked = useAiDockPresent();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const conversation = useState<ChatEntry[]>([]);

  if (!available || docked) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="icon"
        aria-label="Assistente de IA"
        title="Assistente de IA"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 size-12 rounded-full shadow-lg md:bottom-6 md:right-6"
      >
        <Sparkles className="size-5" />
      </Button>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "flex w-full flex-col p-0 sm:max-w-md"
            : "flex h-[85dvh] flex-col p-0 pb-safe-b"
        }
      >
        <SheetTitle className="sr-only">Assistente de IA</SheetTitle>
        <SheetDescription className="sr-only">
          Pergunte sobre o sistema ou envie documentos para cadastrar.
        </SheetDescription>
        <AiChatPanel
          mode="general"
          suggestions={GENERAL_SUGGESTIONS}
          page={pathname}
          conversation={conversation}
          className="h-full"
        />
      </SheetContent>
    </Sheet>
  );
}
