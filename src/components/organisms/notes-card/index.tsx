import { ChevronRight, Paperclip, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ListCard } from "@/components/organisms/list-card";
import { NoteDialog } from "@/components/organisms/note-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { useNotes } from "@/hooks/api/gestao/notes/useNotes";
import type { Note, NoteOwner } from "@/types/note";
import { formatDateTime } from "@/utils/format";
import { markdownPreview, pluralize } from "@/utils/text";

/**
 * "Notas" of a record (staff only), newest first: each one is a short preview
 * that opens the note's own page (full text, files, edit/delete).
 */
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
  const preview = markdownPreview(note.body, 120);
  const fromElsewhere =
    (note.origin.type !== owner.type || note.origin.id !== owner.id) &&
    note.origin.label;
  return (
    <Link
      to={routeTo.note(note.id)}
      className="-mx-2 flex items-start gap-2 rounded-md px-2 py-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Box className="min-w-0 flex-1 space-y-1">
        <Text weight="semibold" className="break-words">
          {note.title || preview || "Nota"}
        </Text>
        {note.title && preview && (
          <Text size="sm" tone="muted" className="break-words">
            {preview}
          </Text>
        )}
        <Text size="xs" tone="muted">
          {note.author.name} · {formatDateTime(note.createdAt)}
          {note.editedAt && " · editada"}
          {fromElsewhere && ` · ${note.origin.label}`}
        </Text>
        {note.documents.length > 0 && (
          <Text size="xs" tone="muted" className="flex items-center gap-1">
            <Paperclip className="size-3.5" aria-hidden />
            {pluralize(note.documents.length, "arquivo", "arquivos")}
          </Text>
        )}
      </Box>
      <ChevronRight
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
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
              <Skeleton shape="text" className="w-full text-sm" />
              <Skeleton shape="text" className="w-28 text-xs" />
            </Box>
          ))}
        </CardContent>
      </Card>
    </SkeletonRegion>
  );
}
