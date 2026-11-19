import { NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Markdown } from "@/components/atoms/markdown";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { BackLink } from "@/components/molecules/back-link";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { InfoItem } from "@/components/molecules/info-item";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { NoteDialog } from "@/components/organisms/note-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RecordAttachments } from "@/components/organisms/record-attachments";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useNote, useNoteWrites } from "@/hooks/api/gestao/notes/useNotes";
import type { Note } from "@/types/note";
import { formatDateTime } from "@/utils/format";

/** Where the note hangs: its page and how to call it. */
function originOf(note: Note) {
  const to =
    note.origin.type === "RENTAL"
      ? routeTo.rental(note.origin.id)
      : routeTo.customer(note.origin.id);
  const label =
    note.origin.label ??
    (note.origin.type === "RENTAL" ? "Locação" : "Cliente");
  return { to, label };
}

/**
 * One staff note: the whole text (Markdown), its files — the audio plays
 * here — and who wrote it. Editing/deleting is for the author or an admin.
 */
export function NoteDetailPage() {
  const { id = "" } = useParams();
  const note = useNote(id);

  return (
    <Box className="space-y-4 md:space-y-6">
      {note.data ? (
        <BackLink
          to={originOf(note.data).to}
          label={originOf(note.data).label}
        />
      ) : (
        <BackLink to={ROUTES.dashboard} label="Painel" />
      )}
      {note.isPending && <NoteDetailSkeleton />}
      {note.isError &&
        (isNotFound(note.error) ? (
          <EmptyState
            icon={NotebookPen}
            title="Nota não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError error={note.error} onRetry={() => note.refetch()} />
        ))}
      {note.data && <NoteDetail note={note.data} />}
    </Box>
  );
}

function NoteDetail({ note }: { note: Note }) {
  const navigate = useNavigate();
  const owner = { type: note.ownerType, id: note.ownerId };
  const { remove } = useNoteWrites(owner);
  const origin = originOf(note);

  return (
    <>
      <PageHeader
        title={note.title || "Nota"}
        actions={
          note.canEdit && (
            <>
              <NoteDialog
                owner={owner}
                note={note}
                trigger={
                  <Button variant="outline">
                    <Pencil />
                    Editar
                  </Button>
                }
              />
              <ConfirmDialog
                trigger={
                  <Button variant="outline">
                    <Trash2 />
                    Excluir
                  </Button>
                }
                title="Excluir nota?"
                description="A nota e os arquivos dela saem de vez."
                confirmLabel="Excluir"
                destructive
                isPending={remove.isPending}
                onConfirm={() =>
                  remove.mutate(note.id, {
                    onSuccess: () => navigate(origin.to, { replace: true }),
                  })
                }
              />
            </>
          )
        }
      />
      <Row className="items-start gap-y-4">
        <Col lg={8}>
          <Card>
            <CardContent className="p-4 md:p-6">
              {note.body.trim() ? (
                <Markdown text={note.body} className="md:text-base" />
              ) : (
                <Text tone="muted">Sem texto: só arquivos.</Text>
              )}
            </CardContent>
          </Card>
        </Col>
        <Col lg={4}>
          <Box className="space-y-4 lg:sticky lg:top-20">
            <Card>
              <CardContent className="p-4 md:p-5">
                <Row as="dl" className="gap-y-3">
                  <InfoItem span={12} label="Em">
                    <TextLink to={origin.to}>{origin.label}</TextLink>
                  </InfoItem>
                  <InfoItem span={6} lg={12} label="Escrita por">
                    {note.author.name}
                  </InfoItem>
                  <InfoItem span={6} lg={12} label="Quando">
                    {formatDateTime(note.createdAt)}
                  </InfoItem>
                  {note.editedAt && (
                    <InfoItem span={6} lg={12} label="Editada em">
                      {formatDateTime(note.editedAt)}
                    </InfoItem>
                  )}
                </Row>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Arquivos</CardTitle>
              </CardHeader>
              <CardContent>
                {note.documents.length === 0 && !note.canEdit ? (
                  <Text tone="muted">Nenhum arquivo.</Text>
                ) : (
                  <RecordAttachments
                    owner={{ type: "NOTE", id: note.id }}
                    attachments={note.documents}
                    invalidate={queryKeys.notes.detail(note.id)}
                    attachLabel="Anexar arquivo"
                    withAttach={note.canEdit}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Col>
      </Row>
    </>
  );
}

function NoteDetailSkeleton() {
  return (
    <SkeletonRegion label="Carregando nota…">
      <Box className="space-y-4 md:space-y-6">
        <Skeleton shape="text" className="w-72 text-2xl" />
        <Row className="items-start gap-y-4">
          <Col lg={8}>
            <Card>
              <CardContent className="space-y-3 p-4 md:p-6">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} shape="text" className="w-full" />
                ))}
              </CardContent>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <CardContent className="space-y-3 p-4 md:p-5">
                <Skeleton shape="text" className="w-32" />
                <Skeleton shape="text" className="w-40" />
                <Skeleton shape="text" className="w-28" />
              </CardContent>
            </Card>
          </Col>
        </Row>
      </Box>
    </SkeletonRegion>
  );
}
