import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { queryKeys } from "@/constants/query-keys";
import { toApiError } from "@/helpers/api-error";
import { contractsService } from "@/services/api/gestao/contracts.service";
import type { ContractDraftState, ContractDraftVia } from "@/types/contract";

/** Typing pause before the autosave. */
const AUTOSAVE_MS = 1200;

export type ContractDraftSyncStatus =
  "saved" | "dirty" | "saving" | "conflict" | "error";

export type ContractDraftSync = {
  id: string;
  /** The text the screen has (what preview and "Gerar PDF" use). */
  html: string;
  /** Changes when the text came from outside the editor: remount the editor with it. */
  editorKey: number;
  status: ContractDraftSyncStatus;
  canUndo: boolean;
  /** Set when a change made elsewhere (chat, MCP, another tab) was loaded. */
  externalVia: ContractDraftVia | null;
  /** Changed elsewhere while this screen had unsaved edits: the person picks. */
  conflict: ContractDraftState | null;
  error: string | null;
  busy: boolean;
  /** The editor changed the text (autosaved after a pause). */
  setHtml: (html: string) => void;
  /** A whole new text from this screen (the chat's Desfazer): reload the editor, autosave. */
  replace: (html: string) => void;
  /** Saves what's pending now; resolves with what the server has. */
  flush: () => Promise<{ html: string; version: number }>;
  /** A newer server state (the chat's answer): load it into the editor. */
  apply: (state: ContractDraftState) => void;
  undo: () => void;
  reset: () => void;
  /** Conflict: drop the local edits and load the version saved elsewhere. */
  takeTheirs: () => void;
  /** Conflict: save this screen's text over the other version (it stays undoable). */
  keepMine: () => void;
  dismissExternal: () => void;
};

/**
 * Keeps the editor's text in step with the draft saved on the server, which
 * the chat and MCP clients also edit: autosave after a pause (with the
 * version read, so nothing is silently overwritten), live reload when the
 * draft changes elsewhere (realtime `contract_draft.updated`), and a choice
 * when both sides changed it.
 */
export function useContractDraftSync(
  initial: ContractDraftState,
): ContractDraftSync {
  const id = initial.id;
  const [html, setHtmlState] = useState(initial.html);
  const [editorKey, setEditorKey] = useState(0);
  const [status, setStatus] = useState<ContractDraftSyncStatus>("saved");
  const [canUndo, setCanUndo] = useState(initial.canUndo);
  const [externalVia, setExternalVia] = useState<ContractDraftVia | null>(null);
  const [conflict, setConflict] = useState<ContractDraftState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const version = useRef(initial.version);
  /** The text the server has (as this screen sent it). */
  const saved = useRef(initial.html);
  const latest = useRef(initial.html);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saving = useRef(false);
  const blocked = useRef(false);

  const live = useQuery({
    queryKey: queryKeys.contractDrafts.detail(id),
    queryFn: () => contractsService.getDraft(id),
    initialData: initial,
    staleTime: Infinity,
  });

  const load = useCallback((state: ContractDraftState, external: boolean) => {
    version.current = state.version;
    saved.current = state.html;
    latest.current = state.html;
    blocked.current = false;
    setHtmlState(state.html);
    setEditorKey((key) => key + 1);
    setCanUndo(state.canUndo);
    setConflict(null);
    setError(null);
    setStatus("saved");
    if (external) setExternalVia(state.updatedVia);
  }, []);

  /** A newer version arrived from elsewhere: load it, or ask if there are local edits. */
  const reconcile = useCallback(
    (state: ContractDraftState | undefined) => {
      if (!state || saving.current || state.version <= version.current) return;
      if (latest.current === saved.current && !blocked.current) {
        load(state, true);
      } else {
        blocked.current = true;
        setConflict(state);
        setStatus("conflict");
      }
    },
    [load],
  );

  const runSave = useCallback(async () => {
    if (blocked.current) return;
    const text = latest.current;
    if (text === saved.current) return;
    saving.current = true;
    setStatus("saving");
    try {
      const state = await contractsService.saveDraft(id, text, version.current);
      version.current = state.version;
      saved.current = text;
      setCanUndo(state.canUndo);
      setError(null);
      setStatus(latest.current === text ? "saved" : "dirty");
    } catch (failure) {
      const apiError = toApiError(failure);
      if (apiError.status === 409) {
        blocked.current = true;
        const server = await contractsService.getDraft(id).catch(() => null);
        setConflict(server);
        setStatus("conflict");
      } else {
        setError(apiError.message);
        setStatus("error");
      }
    } finally {
      saving.current = false;
    }
  }, [id]);

  const saveNow = useCallback(() => {
    clearTimeout(timer.current);
    queue.current = queue.current.then(runSave);
    return queue.current;
  }, [runSave]);

  useEffect(() => {
    reconcile(live.data);
  }, [live.data, reconcile]);

  // Leaving the screen with a pending change: save it.
  useEffect(
    () => () => {
      if (latest.current !== saved.current) void saveNow();
    },
    [saveNow],
  );

  const setHtml = useCallback(
    (next: string) => {
      latest.current = next;
      setHtmlState(next);
      if (blocked.current) return;
      setStatus("dirty");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void saveNow().then(() => reconcile(live.data));
      }, AUTOSAVE_MS);
    },
    [saveNow, reconcile, live.data],
  );

  const flush = useCallback(async () => {
    await saveNow();
    if (blocked.current) {
      throw new Error(
        "O rascunho mudou em outro lugar. Escolha qual versão manter antes de continuar.",
      );
    }
    return { html: latest.current, version: version.current };
  }, [saveNow]);

  const run = useCallback(
    async (action: (version: number) => Promise<ContractDraftState>) => {
      setBusy(true);
      setError(null);
      try {
        await flush();
        load(await action(version.current), false);
      } catch (failure) {
        setError(toApiError(failure).message);
      } finally {
        setBusy(false);
      }
    },
    [flush, load],
  );

  return {
    id,
    html,
    editorKey,
    status,
    canUndo,
    externalVia,
    conflict,
    error,
    busy,
    setHtml,
    replace: (next) => {
      setHtml(next);
      setEditorKey((key) => key + 1);
    },
    flush,
    apply: useCallback((state) => load(state, false), [load]),
    undo: () => void run((v) => contractsService.undoDraft(id, v)),
    reset: () => void run((v) => contractsService.resetDraft(id, v)),
    takeTheirs: () => {
      if (conflict) load(conflict, true);
    },
    keepMine: () => {
      if (!conflict) return;
      version.current = conflict.version;
      blocked.current = false;
      setConflict(null);
      void saveNow();
    },
    dismissExternal: () => setExternalVia(null),
  };
}
