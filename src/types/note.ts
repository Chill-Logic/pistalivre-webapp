import type { DocumentFile } from "@/types/document";

/** Who a note belongs to (the API grows this list). */
export type NoteOwnerType = "RENTAL" | "CUSTOMER";
export type NoteOwner = { type: NoteOwnerType; id: string };

/** A staff-only note: optional title, text and files (Document NOTE). */
export type Note = {
  id: string;
  ownerType: NoteOwnerType;
  ownerId: string;
  /** Where it hangs (a rental's note on the customer page says so). */
  origin: { type: NoteOwnerType; id: string; label: string | null };
  title: string | null;
  body: string;
  author: { id: string | null; name: string };
  /** Last edit of the title/text (null = never). */
  editedAt: string | null;
  createdAt: string;
  /** The viewer wrote it or is an admin. */
  canEdit: boolean;
  documents: DocumentFile[];
};

export type NoteInput = { title: string; body: string };
