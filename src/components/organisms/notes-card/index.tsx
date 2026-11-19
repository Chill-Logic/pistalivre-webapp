import { Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ListCard } from "@/components/organisms/list-card";
import { NoteDialog } from "@/components/organisms/note-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RecordAttachments } from "@/components/organisms/record-attachments";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { useNotes, useNoteWrites } from "@/hooks/api/gestao/notes/useNotes";
import type { Note, NoteOwner } from "@/types/note";
import { formatDateTime } from "@/utils/format";

/** "Notas" of a record (staff only): newest first, each with its files. */
export function NotesCard({ owner }: { owner: NoteOwner }) {
  const notes = useNotes(owner);

  if (notes.isPending) return <NotesCardSkeleton />;
  if (notes.isError) {
    return <QueryError error={notes.error} onRetry={() => notes.refetch()} />;
  }
  return (
    <ListCard
      title="Notas"
      empty="Combinados, ocorrências e lembretes da equipe (o cliente não vê)."
      isEmpty={notes.data.length === 0}
      actions={
        <NoteDialog
          owner={owner}
          trigger={
            <Button variant="outline" size="sm">
              <Plus />
              Nova nota
            </Button>
          }
        />
      }
    >
      {notes.data.map((note) => (
        <NoteItem key={note.id} owner={owner} note={note} />
      ))}
    </ListCard>
  );
}

function NoteItem({ owner, note }: { owner: NoteOwner; note: Note }) {
  const { remove } = useNoteWrites(owner);
  return (
    <Box className="space-y-2 py-3 first:pt-0 last:pb-0">
      <Box className="flex items-start justify-between gap-2">
        <Box className="min-w-0 space-y-0.5">
          {note.title && (
            <Heading level={3} className="break-words text-sm font-semibold">
              {note.title}
            </Heading>
          )}
          <Text size="xs" tone="muted">
            {note.author.name} · {formatDateTime(note.createdAt)}
            {note.editedAt && " · editada"}
          </Text>
          {(note.origin.type !== owner.type || note.origin.id !== owner.id) &&
            note.origin.label && (
              <Text size="xs" tone="muted">
                Em{" "}
                {note.origin.type === "RENTAL" ? (
                  <Link
                    to={routeTo.rental(note.origin.id)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {note.origin.label}
                  </Link>
                ) : (
                  note.origin.label
                )}
              </Text>
            )}
        </Box>
        {note.canEdit && (
          <Box className="flex shrink-0 gap-1">
            <NoteDialog
              owner={owner}
              note={note}
              trigger={
                <Button variant="ghost" size="icon" aria-label="Editar nota">
                  <Pencil />
                </Button>
              }
            />
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Excluir nota">
                  <Trash2 />
                </Button>
              }
              title="Excluir nota?"
              description="A nota e os arquivos dela saem de vez."
              confirmLabel="Excluir"
              destructive
              isPending={remove.isPending}
              onConfirm={() => remove.mutate(note.id)}
            />
          </Box>
        )}
      </Box>
      {note.body.trim() && (
        <Text className="whitespace-pre-line break-words">{note.body}</Text>
      )}
      <RecordAttachments
        owner={{ type: "NOTE", id: note.id }}
        attachments={note.documents}
        invalidate={queryKeys.notes.byOwner(owner)}
        attachLabel="Anexar arquivo"
        withAttach={note.canEdit}
      />
    </Box>
  );
}

export function NotesCardSkeleton() {
  return (
    <SkeletonRegion label="Carregando notas…">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <Skeleton shape="text" className="w-16 text-base" />
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Box key={index} className="space-y-1.5">
              <Skeleton shape="text" className="w-40" />
              <Skeleton shape="text" className="w-28 text-xs" />
              <Skeleton shape="text" className="w-full" />
            </Box>
          ))}
        </CardContent>
      </Card>
    </SkeletonRegion>
  );
}
