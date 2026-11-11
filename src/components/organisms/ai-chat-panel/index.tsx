import {
  Check,
  MapPin,
  Paperclip,
  SendHorizontal,
  Sparkles,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DropArea } from "@/components/atoms/drop-area";
import { FileInput } from "@/components/atoms/file-input";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ChatMarkdown } from "@/components/atoms/chat-markdown";
import { Textarea } from "@/components/atoms/textarea";
import { ChatAttachmentChip } from "@/components/molecules/chat-attachment-chip";
import { ChoicePrompt } from "@/components/molecules/choice-prompt";
import { AiActionCard } from "@/components/organisms/ai-action-card";
import { toApiError } from "@/helpers/api-error";
import { useAiChat } from "@/hooks/api/gestao/ai/useAi";
import {
  AI_ATTACHMENT_ACCEPT,
  useAiAttachments,
} from "@/hooks/api/gestao/ai/useAiAttachments";
import {
  fulfilledEntry,
  sourcesSummary,
  sourcesToTour,
} from "@/helpers/ai-guide";
import { aiChatEvents, aiGuide } from "@/hooks/ui/useAiGuide";
import type {
  AiChatAction,
  AiChatMode,
  AiChatStep,
  AiUiSource,
} from "@/types/ai";
import type { ContractDraftState } from "@/types/contract";
import { cn } from "@/utils/cn";

/** A file as it shows in a sent message. */
type SentAttachment = {
  id: string;
  name: string;
  isPdf: boolean;
  previewUrl: string | null;
};

export type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  /** Files sent with this (user) message. */
  attachments?: SentAttachment[];
  steps?: AiChatStep[];
  /** Writes the agent proposed: the person confirms each one. */
  actions?: AiChatAction[];
  /** The document before this answer changed it (Desfazer). */
  before?: string;
  /** For the agent only (not shown): e.g. the ids a confirmed action created. */
  note?: string;
  /** Where on the app the data of this answer lives ("Mostrar onde vi isso"). */
  sources?: AiUiSource[];
  /** What the person answered to "Quer ver de onde tirei isso?". */
  sourcesChoice?: "shown" | "skipped";
};

const GREETING: Record<AiChatMode, string> = {
  contract:
    "Olá! Posso ajustar este contrato com você: trocar valores e prazos, incluir acordos, revisar o texto. Consulto a locação, o cliente e os planos quando precisar.",
  proposal:
    "Olá! Posso ajustar esta proposta com você: destacar o plano certo, mudar valores, deixar o texto mais direto. Consulto o lead e os planos quando precisar.",
  partner_contract:
    "Olá! Posso montar este contrato de parceria com você: incluir cláusulas, ajustar prazos e a rescisão, explicar a participação e revisar a linguagem. Consulto o contrato, o parceiro e os veículos quando precisar.",
  general:
    "Olá! Pergunte sobre locações, clientes, cobranças e a frota. Também posso cadastrar um cliente e a locação a partir das fotos ou PDFs dos documentos: cole (Ctrl+V), arraste para cá ou use o clipe.",
};

export type AiChatPanelProps = {
  mode: AiChatMode;
  /** The open document (absent in mode "general"). */
  html?: string;
  /** The agent changed the document (or Desfazer): load it in the editor. */
  onApply?: (html: string) => void;
  suggestions: string[];
  rentalId?: string;
  leadId?: string;
  partnerContractId?: string;
  /** Why the assistant can't work yet (e.g. no preview to edit). */
  disabledReason?: string;
  /** A draft saved on the server: the chat edits it there (and saves). */
  draftId?: string;
  /** Saves what the editor has before asking; resolves with the saved text and version. */
  prepare?: () => Promise<{ html: string; version: number }>;
  /** The draft after the answer (new version): load it in the editor. */
  onDraft?: (draft: ContractDraftState) => void;
  /** The screen the person is on (mode "general"): context for the agent. */
  page?: string;
  /** Shows a close (X) in the header: the floating window. */
  onClose?: () => void;
  /** The chat is about to take the person somewhere (the phone closes the sheet). */
  onNavigate?: () => void;
  /** Keeps the conversation outside the panel (it survives closing a sheet). */
  conversation?: [ChatEntry[], Dispatch<SetStateAction<ChatEntry[]>>];
  className?: string;
};

/**
 * The editor's AI assistant: a conversation with an agent that reads the
 * system's data and edits the open draft with the person's tools. A rental
 * contract is a draft saved on the server (`draftId`): the chat's changes are
 * saved there too; other documents are never saved — the person reviews and
 * saves. Each answer lists what the agent
 * did; a change to the document can be undone; a write it proposed waits for
 * "Confirmar".
 */
export function AiChatPanel({
  mode,
  html = "",
  onApply,
  suggestions,
  rentalId,
  leadId,
  partnerContractId,
  disabledReason,
  draftId,
  prepare,
  onDraft,
  page,
  conversation,
  onClose,
  onNavigate,
  className,
}: AiChatPanelProps) {
  const chat = useAiChat();
  const own = useState<ChatEntry[]>([]);
  const [entries, setEntries] = conversation ?? own;
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const attachments = useAiAttachments();
  const picker = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const blocked = chat.isPending || Boolean(disabledReason);

  // A conversation kept outside (the floating assistant) hears these where it lives.
  useEffect(() => {
    if (conversation) return;
    return aiChatEvents.subscribe((event) => {
      if (event.type === "fulfilled") {
        setEntries((current) => [...current, fulfilledEntry(event)]);
      }
    });
  }, [conversation, setEntries]);

  const setSourcesChoice = (index: number, choice: "shown" | "skipped") =>
    setEntries((current) =>
      current.map((e, i) =>
        i === index ? { ...e, sourcesChoice: choice } : e,
      ),
    );

  const showSources = (sources: AiUiSource[]) => {
    const tour = sourcesToTour(sources);
    if (tour.length === 0) return;
    onNavigate?.();
    aiGuide.tour(tour);
  };

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, chat.isPending]);

  const send = (text: string) => {
    const message = text.trim();
    if (blocked || attachments.uploading) return;
    if (!message && attachments.readyCount === 0) return;
    setError(null);
    setDraft("");
    const files = attachments.take().map((item) => ({
      id: item.uploaded!.id,
      name: item.name,
      isPdf: item.isPdf,
      previewUrl: item.previewUrl,
    }));
    const history = entries.map(
      ({ role, content, attachments: sent, note }) => ({
        role,
        content: note
          ? `${content}
${note}`
          : content,
        ...(sent?.length ? { attachmentIds: sent.map((file) => file.id) } : {}),
      }),
    );
    setEntries((current) => [
      ...current,
      {
        role: "user",
        content: message || "Veja os anexos.",
        ...(files.length ? { attachments: files } : {}),
      },
    ]);
    const before = html;
    const ready = prepare ? prepare() : Promise.resolve({ html, version: 0 });
    ready
      .then((saved) =>
        chat.mutateAsync({
          mode,
          html: saved.html,
          history,
          message,
          ...(rentalId ? { rentalId } : {}),
          ...(leadId ? { leadId } : {}),
          ...(partnerContractId ? { partnerContractId } : {}),
          ...(draftId ? { draftId, version: saved.version } : {}),
          ...(files.length
            ? { attachmentIds: files.map((file) => file.id) }
            : {}),
          ...(page ? { page } : {}),
        }),
      )
      .then(
        (answer) => {
          setEntries((current) => [
            ...current,
            {
              role: "assistant",
              content: answer.reply,
              steps: answer.steps,
              actions: answer.actions,
              sources: answer.sources,
              before: answer.changed ? before : undefined,
            },
          ]);
          if (answer.draft && onDraft) onDraft(answer.draft);
          else if (answer.changed) onApply?.(answer.html);
        },
        (failure) => setError(toApiError(failure).message),
      );
  };

  // Ctrl+V of a screenshot or of files copied in the file explorer: they
  // attach; any text that comes along still pastes into the field.
  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;
    if (!event.clipboardData.getData("text/plain")) event.preventDefault();
    attachments.add(files);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(draft);
    }
  };

  return (
    <DropArea
      onFiles={attachments.add}
      disabled={blocked}
      className={cn("flex min-h-0 flex-col", className)}
      overlay={
        <Box className="flex flex-col items-center gap-2 text-primary">
          <Upload className="size-6" aria-hidden />
          <Text weight="semibold">Solte para anexar</Text>
          <Text size="xs" tone="muted">
            Imagens (JPG, PNG, WebP) ou PDF
          </Text>
        </Box>
      }
    >
      <Box className="flex items-center gap-2 border-b px-4 py-3">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <Text weight="semibold" className="flex-1">
          Assistente de IA
        </Text>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-my-1 size-8"
            aria-label="Fechar o assistente"
            onClick={onClose}
          >
            <X />
          </Button>
        )}
      </Box>

      <Box
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        <Box className="space-y-3">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <Text size="sm">{GREETING[mode]}</Text>
          {disabledReason && (
            <Alert variant="info" role="note">
              {disabledReason}
            </Alert>
          )}
          {entries.length === 0 && !disabledReason && (
            <>
              <Text size="sm" tone="muted">
                Não sabe por onde começar? Escolha uma opção:
              </Text>
              <Box className="flex flex-col items-end gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal rounded-full py-2 text-right"
                    onClick={() => send(suggestion)}
                    disabled={chat.isPending}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Box>

        <List className="space-y-3">
          {entries.map((entry, index) => (
            <ListItem
              key={index}
              className={cn(
                "flex",
                entry.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {entry.role === "user" ? (
                <Box className="flex max-w-[85%] flex-col items-end gap-1.5">
                  {entry.attachments?.map((file) => (
                    <ChatAttachmentChip
                      key={file.id}
                      name={file.name}
                      isPdf={file.isPdf}
                      previewUrl={file.previewUrl}
                      status="ready"
                    />
                  ))}
                  <Box className="rounded-2xl rounded-br-sm bg-primary/10 px-3 py-2">
                    <Text size="sm" className="whitespace-pre-wrap break-words">
                      {entry.content}
                    </Text>
                  </Box>
                </Box>
              ) : (
                <Box className="max-w-[92%] space-y-2 rounded-2xl rounded-bl-sm border bg-card px-3 py-2">
                  <ChatMarkdown text={entry.content} />
                  {entry.steps && entry.steps.length > 0 && (
                    <List className="space-y-0.5">
                      {entry.steps.map((step, i) => (
                        <ListItem key={i} className="flex items-center gap-1.5">
                          {step.ok ? (
                            <Check
                              className="size-3 text-success"
                              aria-hidden
                            />
                          ) : (
                            <X
                              className="size-3 text-destructive"
                              aria-hidden
                            />
                          )}
                          <Text inline size="xs" tone="muted">
                            {step.title}
                          </Text>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {entry.actions?.map((action) => (
                    <AiActionCard
                      key={action.id}
                      action={action}
                      onNavigate={onNavigate}
                      onDone={(outcome) =>
                        setEntries((current) => [
                          ...current,
                          {
                            role: "assistant",
                            content: `Feito: ${outcome.summary}.`,
                            note: `[Resultado da ação confirmada: ${JSON.stringify(outcome.result)}]`,
                          },
                        ])
                      }
                    />
                  ))}
                  {entry.sources && entry.sources.length > 0 && (
                    <ChoicePrompt
                      icon={<MapPin className="size-5" />}
                      title="Quer ver de onde tirei isso?"
                      subtitle={sourcesSummary(entry.sources)}
                      options={[
                        {
                          label: "Sim, me mostra",
                          primary: true,
                          onSelect: () => {
                            setSourcesChoice(index, "shown");
                            showSources(entry.sources ?? []);
                          },
                        },
                        {
                          label: "Agora não",
                          onSelect: () => setSourcesChoice(index, "skipped"),
                        },
                      ]}
                      answered={
                        entry.sourcesChoice === "shown" ? (
                          <>
                            Você viu as telas.{" "}
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => showSources(entry.sources ?? [])}
                            >
                              Mostrar de novo
                            </Button>
                          </>
                        ) : entry.sourcesChoice === "skipped" ? (
                          <>
                            Você preferiu não ver agora.{" "}
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => showSources(entry.sources ?? [])}
                            >
                              Mostrar
                            </Button>
                          </>
                        ) : undefined
                      }
                      autoFocus={
                        index === entries.length - 1 && !entry.actions?.length
                      }
                    />
                  )}
                  {entry.before !== undefined && (
                    <Box className="flex items-center justify-between gap-2 border-t pt-2">
                      <Text size="xs" tone="muted">
                        Documento atualizado
                      </Text>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onApply?.(entry.before as string);
                          setEntries((current) =>
                            current.map((e, i) =>
                              i === index ? { ...e, before: undefined } : e,
                            ),
                          );
                        }}
                      >
                        <Undo2 />
                        Desfazer
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        {chat.isPending && (
          <Box className="flex items-center gap-2">
            <Spinner />
            <Text size="sm" tone="muted">
              Pensando…
            </Text>
          </Box>
        )}
        {error && <Alert>{error}</Alert>}
        <Box ref={bottom} />
      </Box>

      <Box className="space-y-2 border-t px-4 py-3">
        {attachments.items.length > 0 && (
          <Box className="flex flex-wrap gap-1.5">
            {attachments.items.map((item) => (
              <ChatAttachmentChip
                key={item.key}
                name={item.name}
                isPdf={item.isPdf}
                previewUrl={item.previewUrl}
                status={item.status}
                progress={item.progress}
                error={item.error}
                onRemove={() => attachments.remove(item.key)}
              />
            ))}
          </Box>
        )}
        {attachments.notice && (
          <Text size="xs" tone="muted">
            {attachments.notice}
          </Text>
        )}
        <Box className="flex items-end gap-2">
          <FileInput
            ref={picker}
            accept={AI_ATTACHMENT_ACCEPT}
            multiple
            onChange={(event) => {
              attachments.add(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Anexar imagem ou PDF"
            title="Anexar imagem ou PDF (ou cole com Ctrl+V, ou arraste para cá)"
            onClick={() => picker.current?.click()}
            disabled={blocked}
          >
            <Paperclip />
          </Button>
          <Textarea
            aria-label="Mensagem para a IA"
            placeholder={
              mode === "general"
                ? "Pergunte ou envie documentos…"
                : "Peça um ajuste…"
            }
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            className="min-h-11 resize-none"
            disabled={blocked}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Enviar"
            onClick={() => send(draft)}
            disabled={
              blocked ||
              attachments.uploading ||
              (!draft.trim() && attachments.readyCount === 0)
            }
          >
            <SendHorizontal />
          </Button>
        </Box>
        <Text size="xs" tone="muted" className="text-center">
          {mode === "general"
            ? "A IA pode errar: confira os dados antes de confirmar."
            : "A IA pode errar: revise o documento antes de salvar."}
        </Text>
      </Box>
    </DropArea>
  );
}
