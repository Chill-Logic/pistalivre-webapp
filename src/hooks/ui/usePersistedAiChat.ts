import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ChatEntry } from "@/components/organisms/ai-chat-panel";
import { readAiChat, writeAiChat } from "@/helpers/ai-chat-storage";
import { useMe } from "@/hooks/api/comum/session/useMe";

type Held = { key: string | null; entries: ChatEntry[] };

/**
 * An assistant conversation that survives F5 / Ctrl+Shift+R: saved in the
 * browser per person and per place (`scope`: the floating assistant, or the
 * document being edited), so reloading by accident doesn't lose a long
 * conversation (the pasted deal, the answers, the files sent). The state
 * carries the key it belongs to, so switching places never writes one
 * conversation under the other's key.
 */
export function usePersistedAiChat(scope: string): [ChatEntry[], Dispatch<SetStateAction<ChatEntry[]>>] {
  const me = useMe();
  const userId = me.data?.id ?? null;
  const key = userId ? `${userId}\u0000${scope}` : null;
  const [held, setHeld] = useState<Held>(() => ({
    key,
    entries: userId ? readAiChat(userId, scope) : [],
  }));

  // The person (or the place) is known now / changed: load what was saved there.
  useEffect(() => {
    if (!userId || held.key === key) return;
    setHeld({ key, entries: readAiChat(userId, scope) });
  }, [userId, scope, key, held.key]);

  useEffect(() => {
    if (!userId || held.key !== key) return;
    writeAiChat(userId, scope, held.entries);
  }, [held, userId, scope, key]);

  const setEntries = useCallback<Dispatch<SetStateAction<ChatEntry[]>>>(
    (next) =>
      setHeld((current) => ({
        ...current,
        entries: typeof next === "function" ? next(current.entries) : next,
      })),
    [],
  );

  return [held.key === key ? held.entries : [], setEntries];
}
