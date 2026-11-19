import { http } from "@/services/http/client";
import type { Note, NoteInput, NoteOwner } from "@/types/note";

export const notesService = {
  async list(owner: NoteOwner) {
    const { data } = await http.get<{ items: Note[] }>("/notes", {
      params: { ownerType: owner.type, ownerId: owner.id },
    });
    return data.items;
  },
  /** Title, text and files in ONE request: a failed file keeps nothing. */
  async create(owner: NoteOwner, input: NoteInput, files: File[]) {
    const body = new FormData();
    body.append("ownerType", owner.type);
    body.append("ownerId", owner.id);
    body.append("title", input.title);
    body.append("body", input.body);
    for (const file of files) body.append("files", file);
    const { data } = await http.post<Note>("/notes", body);
    return data;
  },
  async update(id: string, input: NoteInput) {
    const { data } = await http.put<Note>(`/notes/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/notes/${id}`);
  },
};
