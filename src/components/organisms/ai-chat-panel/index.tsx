import {
  ArrowUp,
  Check,
  ChevronRight,
  Circle,
  HelpCircle,
  MapPin,
  Mic,
  Paperclip,
  Sparkles,
  Undo2,
  Upload,
  X,
  SquarePen,
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
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
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
import { useSpeechDictation } from "@/hooks/ui/useSpeechDictation";
import { aiStatusText } from "@/helpers/ai-status";
import { createStepPacer } from "@/helpers/step-pacer";
import { ASSISTANT_NAME, CAPABILITIES, pickOpening } from "@/helpers/livrinho";
import { useMe } from "@/hooks/api/comum/session/useMe";
import { firstName } from "@/utils/format";
import {
  fulfilledEntry,
  sourcesSummary,
  sourcesToTour,
} from "@/helpers/ai-guide";
import { aiChatEvents, aiGuide } from "@/hooks/ui/useAiGuide";
import type {
  AiChatAction,
  AiChatChoices,
  AiChatLiveStep,
  AiChatMode,
  AiChatStep,
  AiUiSource,
} from "@/types/ai";
import type { ContractDraftState } from "@/types/contract";
import { usePersistedAiChat } from "@/hooks/ui/usePersistedAiChat";
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
  /** The person asked where the data is: the card shows (with this or the last answer's places). */
  offerSources?: boolean;
  /** What the person answered to "Quer ver de onde tirei isso?". */
  sourcesChoice?: "shown" | "skipped";
  /** An action just got done: the chat says "Pode seguir." on its own once. */
  continueAfter?: boolean;
  /** How long the answer took on screen ("Trabalhou por 6s"). */
  workedMs?: number;
  /** The steps of this answer, opened under "Trabalhou por…". */
  stepsOpen?: boolean;
  /** The AI wasn't sure what was meant: options as buttons. */
  choices?: AiChatChoices | null;
  /** The option the person clicked. */
  chosen?: string;
};

/** "Trabalhou por 6s" / "Consultou 3 coisas" (older answers have no time). */
function workedLabel(entry: ChatEntry) {
  const count = entry.steps?.length ?? 0;
  if (!entry.workedMs)
    return `Consultou ${count} ${count === 1 ? "coisa" : "coisas"}`;
  const seconds = Math.max(1, Math.round(entry.workedMs / 1000));
  return seconds < 60
    ? `Trabalhou por ${seconds}s`
    : `Trabalhou por ${Math.floor(seconds / 60)}min ${seconds % 60}s`;
}

/** The answer only repeats the options' question: the card says it already. */
function repeatsQuestion(entry: ChatEntry) {
  if (!entry.choices) return false;
  const plain = (text: string) =>
    text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  const reply = plain(entry.content);
  return !reply || reply === plain(entry.choices.question);
}

/** Sent on its own after a confirmed/saved action: the agent goes on with the request. */
const CONTINUE_MESSAGE = "Pode seguir.";

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
  // Saved in the browser (survives F5) per document; the floating assistant keeps its own.
  const own = usePersistedAiChat(
    `${mode}:${draftId ?? partnerContractId ?? rentalId ?? leadId ?? "new"}`,
  );
  const [entries, setEntries] = conversation ?? own;
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The tools of the answer being prepared, as they run.
  const [live, setLive] = useState<AiChatLiveStep[]>([]);
  // A few of the starting points, different each time the chat opens.
  const me = useMe();
  // The opening line: one at random each time the chat opens.
  const [opening] = useState(() =>
    pickOpening(mode, me.data ? firstName(me.data.name) : null),
  );
  const [shownSuggestions] = useState(() =>
    [...suggestions].sort(() => Math.random() - 0.5).slice(0, 4),
  );
  // Picks the status phrases of this answer (other words on the next one).
  const [statusSeed, setStatusSeed] = useState("");
  const attachments = useAiAttachments();
  const dictation = useSpeechDictation(setDraft);
  const picker = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  // Working = the request is out OR its steps are still being shown (paced).
  const [pacing, setPacing] = useState(false);
  const working = chat.isPending || pacing;
  const blocked = working || Boolean(disabledReason);

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

  /** Where an answer's data lives: its own places, or the last answer's ("onde acho isso?" after it). */
  const placesOf = (index: number): AiUiSource[] => {
    for (let i = index; i >= 0; i -= 1) {
      const places = entries[i].sources;
      if (entries[i].role === "assistant" && places?.length) return places;
    }
    return [];
  };

  const showSources = (sources: AiUiSource[]) => {
    const tour = sourcesToTour(sources);
    if (tour.length === 0) return;
    onNavigate?.();
    aiGuide.tour(tour);
  };

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, working, live.length]);

  // After a confirmed (or saved-by-the-form) action, the request goes on:
  // the next step (e.g. the rental, with the customer just created).
  const lastEntry = entries[entries.length - 1];
  useEffect(() => {
    if (!lastEntry?.continueAfter || blocked) return;
    setEntries((current) =>
      current.map((e, i) =>
        i === current.length - 1 ? { ...e, continueAfter: false } : e,
      ),
    );
    send(CONTINUE_MESSAGE, { auto: true });
    // Once per done action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEntry, blocked]);

  const send = (text: string, { auto = false } = {}) => {
    const message = text.trim();
    if (blocked || (!auto && attachments.uploading)) return;
    if (!message && (auto || attachments.readyCount === 0)) return;
    setError(null);
    if (!auto) {
      dictation.cancel();
      setDraft("");
    }
    const files = (auto ? [] : attachments.take()).map((item) => ({
      id: item.uploaded!.id,
      name: item.name,
      isPdf: item.isPdf,
      previewUrl: item.previewUrl,
    }));
    const history = entries.map(
      ({ role, content, attachments: sent, note, steps }) => ({
        role,
        content: note
          ? `${content}
${note}`
          : content,
        ...(sent?.length ? { attachmentIds: sent.map((file) => file.id) } : {}),
        ...(role === "assistant" && !note
          ? {
              tools: (steps ?? [])
                .filter((step) => step.ok)
                .map((step) => step.title),
            }
          : {}),
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
    const startedAt = Date.now();
    setLive([]);
    setPacing(true);
    setStatusSeed(String(Math.random()));
    const pacer = createStepPacer((step) =>
      setLive((current) => [...current.filter((s) => s.id !== step.id), step]),
    );
    const ready = prepare ? prepare() : Promise.resolve({ html, version: 0 });
    ready
      .then((saved) =>
        chat.mutateAsync({
          onStep: pacer.push,
          input: {
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
          },
        }),
      )
      // The answer waits for the last step to finish "running" on screen.
      .then((answer) => pacer.drained().then(() => answer))
      .then(
        (answer) => {
          setEntries((current) => [
            ...current,
            {
              role: "assistant",
              content: answer.reply,
              steps: answer.steps,
              workedMs: Date.now() - startedAt,
              actions: answer.actions,
              sources: answer.sources,
              // An older server sent places only when asked.
              offerSources:
                answer.offerSources ?? Boolean(answer.sources?.length),
              choices: answer.choices,
              before: answer.changed ? before : undefined,
            },
          ]);
          if (answer.draft && onDraft) onDraft(answer.draft);
          else if (answer.changed) onApply?.(answer.html);
        },
        (failure) => setError(toApiError(failure).message),
      )
      .finally(() => {
        setLive([]);
        setPacing(false);
      });
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
        <Text weight="semibold">{ASSISTANT_NAME}</Text>
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          AI
        </Badge>
        <Box className="flex-1" />
        {entries.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-my-1 size-8"
            aria-label="Nova conversa"
            title="Nova conversa"
            disabled={working}
            onClick={() => {
              setEntries([]);
              setError(null);
            }}
          >
            <SquarePen />
          </Button>
        )}
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-my-1 size-8"
            aria-label="Fechar o Livrinho"
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
        {entries.length === 0 ? (
          <Box className="flex min-h-full flex-col items-center justify-center gap-3 py-6 text-center">
            <Sparkles className="size-8 text-primary" aria-hidden />
            <Heading
              level={2}
              variant="title"
              className="max-w-xs text-balance"
            >
              {opening}
            </Heading>
            <Text size="sm" tone="muted" className="max-w-sm text-balance">
              {CAPABILITIES[mode]}
            </Text>
            {disabledReason ? (
              <Alert variant="info" role="note">
                {disabledReason}
              </Alert>
            ) : (
              <Box className="flex flex-wrap justify-center gap-2 pt-2">
                {shownSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal rounded-full py-2"
                    onClick={() => send(suggestion)}
                    disabled={working}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          disabledReason && (
            <Alert variant="info" role="note">
              {disabledReason}
            </Alert>
          )
        )}

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
                  {!repeatsQuestion(entry) && (
                    <ChatMarkdown text={entry.content} />
                  )}
                  {entry.steps && entry.steps.length > 0 && (
                    <Box className="space-y-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-7 gap-1 px-2 text-xs font-normal text-muted-foreground"
                        aria-expanded={Boolean(entry.stepsOpen)}
                        onClick={() =>
                          setEntries((current) =>
                            current.map((e, i) =>
                              i === index
                                ? { ...e, stepsOpen: !e.stepsOpen }
                                : e,
                            ),
                          )
                        }
                      >
                        {workedLabel(entry)}
                        <ChevronRight
                          className={cn(
                            "size-3.5 transition-transform",
                            entry.stepsOpen && "rotate-90",
                          )}
                          aria-hidden
                        />
                      </Button>
                      {entry.stepsOpen && (
                        <List className="space-y-0.5 border-l pl-3">
                          {entry.steps.map((step, i) => (
                            <ListItem
                              key={i}
                              className="flex items-center gap-1.5"
                            >
                              {step.ok ? (
                                <Check
                                  className="size-3.5 text-success-foreground"
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
                    </Box>
                  )}
                  {entry.actions?.map((action) => (
                    <AiActionCard
                      key={action.id}
                      action={action}
                      onNavigate={onNavigate}
                      onDone={(outcome) => {
                        setEntries((current) => [
                          ...current,
                          {
                            role: "assistant",
                            content: `Feito: ${outcome.summary}.`,
                            note: `[Resultado da ação confirmada: ${JSON.stringify(outcome.result)}]`,
                            continueAfter: true,
                          },
                        ]);
                        // The screen may follow (e.g. the contract just created opens).
                        aiChatEvents.emit({
                          type: "confirmed",
                          actionId: action.id,
                          summary: outcome.summary,
                          result: outcome.result,
                        });
                      }}
                    />
                  ))}
                  {entry.offerSources && placesOf(index).length > 0 && (
                    <ChoicePrompt
                      icon={<MapPin className="size-5" />}
                      title="Quer ver de onde tirei isso?"
                      subtitle={sourcesSummary(placesOf(index))}
                      options={[
                        {
                          label: "Sim, me mostra",
                          primary: true,
                          onSelect: () => {
                            setSourcesChoice(index, "shown");
                            showSources(placesOf(index));
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
                              onClick={() => showSources(placesOf(index))}
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
                              onClick={() => showSources(placesOf(index))}
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
                  {entry.choices && (
                    <ChoicePrompt
                      icon={<HelpCircle className="size-5" />}
                      title={entry.choices.question}
                      options={entry.choices.options.map((option) => ({
                        label: option,
                        disabled: blocked && !entry.chosen,
                        onSelect: () => {
                          setEntries((current) =>
                            current.map((e, i) =>
                              i === index ? { ...e, chosen: option } : e,
                            ),
                          );
                          send(option);
                        },
                      }))}
                      answered={
                        entry.chosen && `Você escolheu: ${entry.chosen}`
                      }
                      autoFocus={index === entries.length - 1}
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

        {working && (
          <Box className="space-y-1">
            {live.length > 0 && (
              <List className="space-y-0.5">
                {live.map((step) => (
                  <ListItem key={step.id} className="flex items-center gap-1.5">
                    {step.status === "running" ? (
                      <Spinner className="size-3" />
                    ) : step.ok ? (
                      <Check
                        className="size-3.5 text-success-foreground"
                        aria-hidden
                      />
                    ) : (
                      <X className="size-3 text-destructive" aria-hidden />
                    )}
                    <Text inline size="xs" tone="muted">
                      {step.title}
                    </Text>
                  </ListItem>
                ))}
              </List>
            )}
            <Box className="flex items-center gap-2">
              <Spinner />
              <Text size="sm" tone="muted">
                {aiStatusText(live, statusSeed)}
              </Text>
            </Box>
          </Box>
        )}
        {error && <Alert>{error}</Alert>}
        <Box ref={bottom} />
      </Box>

      <Box className="space-y-1.5 border-t px-3 pb-2 pt-3">
        {/* One box, like a chat app: the text on top, the tools under it. */}
        <Box className="rounded-2xl border bg-card shadow-sm transition-shadow focus-within:ring-1 focus-within:ring-ring">
          {attachments.items.length > 0 && (
            <Box className="flex flex-wrap gap-1.5 px-3 pt-3">
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
            <Text size="xs" tone="muted" className="px-3 pt-2">
              {attachments.notice}
            </Text>
          )}
          <Textarea
            aria-label="Mensagem para a IA"
            placeholder={
              dictation.listening
                ? "Pode falar…"
                : mode === "general"
                  ? "Pergunte ou envie documentos…"
                  : "Peça um ajuste…"
            }
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            // Its own paste: the page's attach areas (usePasteFiles) leave it alone.
            data-own-paste
            className="max-h-40 min-h-12 resize-none border-0 bg-transparent px-3 pt-3 shadow-none focus-visible:ring-0"
            disabled={blocked}
          />
          <Box className="flex items-center gap-1 px-2 pb-2">
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
              className="size-8 shrink-0 rounded-full text-muted-foreground"
              aria-label="Anexar imagem ou PDF"
              title="Anexar imagem ou PDF (ou cole com Ctrl+V, ou arraste para cá)"
              onClick={() => picker.current?.click()}
              disabled={blocked}
            >
              <Paperclip />
            </Button>
            {dictation.listening && (
              <Text
                size="xs"
                className="flex items-center gap-1.5 pl-1 text-primary"
              >
                <Circle className="size-2 fill-current" aria-hidden />
                Ouvindo…
              </Text>
            )}
            <Box className="ml-auto flex items-center gap-1">
              {dictation.supported && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "size-8 shrink-0 rounded-full text-muted-foreground",
                    dictation.listening &&
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                  )}
                  aria-label={dictation.listening ? "Parar o ditado" : "Falar"}
                  aria-pressed={dictation.listening}
                  title={
                    dictation.listening
                      ? "Parar o ditado"
                      : "Falar em vez de digitar"
                  }
                  onClick={() =>
                    dictation.listening
                      ? dictation.stop()
                      : dictation.start(draft)
                  }
                  disabled={blocked}
                >
                  <Mic />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                aria-label="Enviar"
                onClick={() => send(draft)}
                disabled={
                  blocked ||
                  attachments.uploading ||
                  (!draft.trim() && attachments.readyCount === 0)
                }
              >
                <ArrowUp />
              </Button>
            </Box>
          </Box>
        </Box>
        {dictation.error ? (
          <Text size="xs" tone="destructive" className="text-center">
            {dictation.error}
          </Text>
        ) : (
          <Text size="xs" tone="muted" className="text-center">
            {mode === "general"
              ? "A IA pode errar: confira os dados antes de confirmar."
              : "A IA pode errar: revise o documento antes de salvar."}
          </Text>
        )}
      </Box>
    </DropArea>
  );
}
