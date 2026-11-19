import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { notesService } from "@/services/api/gestao/notes.service";
import type { NoteInput, NoteOwner } from "@/types/note";

export function useNotes(owner: NoteOwner) {
  return useQuery({
    queryKey: queryKeys.notes.byOwner(owner),
    queryFn: () => notesService.list(owner),
  });
}

/** Write, edit and delete the notes of one record. */
export function useNoteWrites(owner: NoteOwner) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.byOwner(owner) });

  const create = useMutation({
    mutationFn: ({ input, files }: { input: NoteInput; files: File[] }) =>
      notesService.create(owner, input, files),
    onSuccess: () => {
      void refresh();
      toast.success("Nota salva");
    },
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: NoteInput }) =>
      notesService.update(id, input),
    onSuccess: () => {
      void refresh();
      toast.success("Nota atualizada");
    },
  });
  const remove = useMutation({
    mutationFn: notesService.remove,
    onSuccess: () => {
      void refresh();
      toast.success("Nota excluída");
    },
  });
  return { create, update, remove };
}
