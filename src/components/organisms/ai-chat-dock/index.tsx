import { Sparkles } from "lucide-react";
import { useState } from "react";
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
  type AiChatPanelProps,
} from "@/components/organisms/ai-chat-panel";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import { useRegisterAiDock } from "@/hooks/ui/useAiDockPresence";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

/**
 * Where the assistant lives next to an editor: a sticky side card on the
 * desktop, a button + bottom sheet on the phone. Absent when the AI isn't
 * configured or the person has no chat tools (Permissões da IA).
 */
export function AiChatDock(props: Omit<AiChatPanelProps, "className">) {
  const available = useAiChatAvailable();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [open, setOpen] = useState(false);
  // The floating assistant steps aside while the editor has its own.
  useRegisterAiDock(available);
  if (!available) return null;

  if (isDesktop) {
    return (
      <Card className="sticky top-20 flex h-[calc(100dvh-7rem)] flex-col overflow-hidden">
        <AiChatPanel {...props} className="h-full" />
      </Card>
    );
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Sparkles />
        Assistente de IA
      </Button>
      <SheetContent
        side="bottom"
        className="flex h-[85dvh] flex-col p-0 pb-safe-b"
      >
        <SheetTitle className="sr-only">Assistente de IA</SheetTitle>
        <SheetDescription className="sr-only">
          Converse com a IA para ajustar o documento.
        </SheetDescription>
        <AiChatPanel {...props} className="h-full" />
      </SheetContent>
    </Sheet>
  );
}
