import type { ChatEntry } from "@/components/organisms/ai-chat-panel";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";

/** A conversation untouched for this long starts over (yesterday's chat isn't today's). */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
/** Only the end of a long conversation is kept (the agent reads the history anyway). */
const MAX_ENTRIES = 60;

type Stored = { savedAt: number; entries: ChatEntry[] };

const keyOf = (userId: string, scope: string) => `${STORAGE_KEYS.aiChat}:${userId}:${scope}`;

/** The conversation saved for this person and place; [] when none, expired or unreadable. */
export function readAiChat(userId: string, scope: string): ChatEntry[] {
  try {
    const parsed = JSON.parse(safeStorage.get(keyOf(userId, scope)) ?? "null") as Stored | null;
    if (!parsed || !Array.isArray(parsed.entries)) return [];
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      safeStorage.remove(keyOf(userId, scope));
      return [];
    }
    return parsed.entries;
  } catch {
    return [];
  }
}

/**
 * Saves the conversation. The thumbnails of sent files are `blob:` URLs that
 * die with the page, so they go out (the chip keeps the name); an empty
 * conversation clears the key.
 */
export function writeAiChat(userId: string, scope: string, entries: ChatEntry[]) {
  if (entries.length === 0) {
    safeStorage.remove(keyOf(userId, scope));
    return;
  }
  const kept = entries.slice(-MAX_ENTRIES).map((entry) =>
    entry.attachments?.length
      ? {
          ...entry,
          attachments: entry.attachments.map((file) => ({
            ...file,
            previewUrl: file.previewUrl?.startsWith("blob:") ? null : file.previewUrl,
          })),
        }
      : entry,
  );
  safeStorage.set(keyOf(userId, scope), JSON.stringify({ savedAt: Date.now(), entries: kept } satisfies Stored));
}

/** The floating assistant was open in this tab (it reopens after F5). */
export function readAiChatOpen(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEYS.aiChatOpen) === "1";
  } catch {
    return false;
  }
}

export function writeAiChatOpen(open: boolean) {
  try {
    if (open) window.sessionStorage.setItem(STORAGE_KEYS.aiChatOpen, "1");
    else window.sessionStorage.removeItem(STORAGE_KEYS.aiChatOpen);
  } catch {
    /* storage unavailable: it just starts closed */
  }
}
