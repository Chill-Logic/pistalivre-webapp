import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { ExternalLink } from "@/components/atoms/external-link";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { InfoItem } from "@/components/molecules/info-item";
import { SecureImage } from "@/components/molecules/secure-image";
import { PhotoLightbox } from "@/components/organisms/photo-lightbox";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import {
  AI_ACTION_AMOUNT_LABELS as AMOUNT_LABELS,
  AI_ACTION_STATUS as STATUS,
  aiActionChannel,
  aiActionLink,
  aiActionSummary,
  formatAiActionValue as show,
} from "@/helpers/ai-action";
import type { AiActionItem } from "@/types/ai";
import type { GalleryPhoto } from "@/types/document";
import { formatDateTime } from "@/utils/format";

/** Details the server marks as a warning (similar records already in the system). */
const WARNING_PREFIX = "Atenção";
/** Long texts: full width, at the end. */
const LONG_LABELS = new Set(["Serviços", "Descrição", "Observações", "Débitos que ele já tem"]);
/** Already shown as the files themselves. */
const HIDDEN_LABELS = new Set(["Anexos", "Documentos"]);

type AiActionReviewCardProps = {
  action: AiActionItem;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirming?: boolean;
  cancelling?: boolean;
};

/**
 * One write the AI proposed, to review before saying "sim": the amount and
 * the summary on top, the facts in a grid, the long texts after, and the
 * receipts as pictures beside them on the desktop (below on the phone) —
 * tap to see them full screen. Decided ones show the outcome and the link.
 */
export function AiActionReviewCard({ action, onConfirm, onCancel, confirming = false, cancelling = false }: AiActionReviewCardProps) {
  const { view, download } = useFileActions();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const status = STATUS[action.status];
  const entries = Object.entries(action.details).filter(
    ([label, value]) => value != null && value !== "" && !HIDDEN_LABELS.has(label),
  );
  const warnings = entries.filter(([label]) => label.startsWith(WARNING_PREFIX));
  const amount = entries.find(([label]) => AMOUNT_LABELS.includes(label));
  const facts = entries.filter(
    ([label]) => !label.startsWith(WARNING_PREFIX) && !AMOUNT_LABELS.includes(label) && !LONG_LABELS.has(label),
  );
  const texts = entries.filter(([label]) => LONG_LABELS.has(label));

  const images = action.files.filter((file) => file.contentType.startsWith("image/"));
  const others = action.files.filter((file) => !file.contentType.startsWith("image/"));
  const gallery = useMemo<GalleryPhoto[]>(
    () => images.map((file) => ({ key: file.id, label: file.fileName, file })),
    [images],
  );

  const link = aiActionLink(action);
  const pending = action.status === "PENDING";
  const busy = confirming || cancelling;
  const hasFiles = action.files.length > 0;

  return (
    <Card className={pending ? "border-warning" : undefined}>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Box className="flex flex-wrap items-start justify-between gap-3">
          <Box className="min-w-0 flex-1 space-y-2">
            <Box className="flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant="outline">{action.toolTitle}</Badge>
              <Badge variant="outline">{aiActionChannel(action)}</Badge>
            </Box>
            <Heading level={3} className="text-base leading-snug">
              {aiActionSummary(action)}
            </Heading>
            <Text size="xs" tone="muted">
              Pedida em {formatDateTime(action.createdAt)}
              {pending ? ` · expira ${formatDateTime(action.expiresAt)}` : ""}
              {action.decidedAt ? ` · decidida em ${formatDateTime(action.decidedAt)}` : ""}
            </Text>
          </Box>
          {amount && (
            <Box className="shrink-0 text-right">
              <Text size="xs" tone="muted">
                {amount[0]}
              </Text>
              <Text weight="medium" className="text-xl tabular-nums">
                {show(amount[1])}
              </Text>
            </Box>
          )}
        </Box>

        {warnings.map(([label, value]) => (
          <Alert key={label} variant="warning">
            {label}: {show(value)}
          </Alert>
        ))}

        <Row className="gap-y-4">
          <Col lg={hasFiles ? 7 : 12} className="space-y-4">
            <Row as="dl" className="gap-y-3">
              {facts.map(([label, value]) => (
                <InfoItem key={label} label={label} span={6} md={4}>
                  {show(value)}
                </InfoItem>
              ))}
            </Row>
            {texts.length > 0 && (
              <Row as="dl" className="gap-y-3 border-t pt-3">
                {texts.map(([label, value]) => (
                  <InfoItem key={label} label={label}>
                    {show(value)}
                  </InfoItem>
                ))}
              </Row>
            )}
          </Col>

          {hasFiles && (
            <Col lg={5} className="space-y-2">
              <Text size="sm" weight="medium">
                {action.files.length === 1 ? "Arquivo" : `Arquivos (${action.files.length})`}
              </Text>
              {images.length > 0 && (
                <Row className="gap-y-2">
                  {images.map((file, index) => (
                    <Col key={file.id} span={images.length === 1 ? 12 : 6}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="block h-auto w-full overflow-hidden rounded-md border p-0 md:h-auto"
                        aria-label={`Ampliar ${file.fileName}`}
                        onClick={() => {
                          setPhotoIndex(index);
                          setFullscreen(true);
                        }}
                      >
                        {/* The box sets the size; the image fills it (size-full needs a sized parent). */}
                        <Box className={images.length === 1 ? "h-72 w-full bg-muted" : "aspect-[3/4] w-full bg-muted"}>
                          <SecureImage
                            file={file}
                            alt={file.fileName}
                            fit={images.length === 1 ? "contain" : "cover"}
                          />
                        </Box>
                      </Button>
                    </Col>
                  ))}
                </Row>
              )}
              {others.length > 0 && (
                <Box className="divide-y rounded-md border">
                  {others.map((file) => (
                    <DocumentItem
                      key={file.id}
                      document={file}
                      onView={() => view.mutate(file)}
                      onDownload={() => download.mutate(file)}
                      isViewing={view.isPending && view.variables?.id === file.id}
                      isDownloading={download.isPending && download.variables?.id === file.id}
                    />
                  ))}
                </Box>
              )}
            </Col>
          )}
        </Row>

        {action.error && <Alert>{action.error}</Alert>}

        {(pending || link) && (
          <Box className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
            {link && (
              <ExternalLink href={link} className="text-sm sm:mr-auto">
                Abrir no sistema
              </ExternalLink>
            )}
            {pending && (
              <>
                <Button variant="outline" onClick={onCancel} disabled={busy}>
                  {cancelling ? <Spinner /> : <X className="size-4" aria-hidden />}
                  Cancelar
                </Button>
                <Button onClick={onConfirm} disabled={busy}>
                  {confirming ? <Spinner className="text-primary-foreground" /> : <Check className="size-4" aria-hidden />}
                  Confirmar
                </Button>
              </>
            )}
          </Box>
        )}
      </CardContent>

      {gallery.length > 0 && (
        <PhotoLightbox
          photos={gallery}
          index={photoIndex}
          onIndexChange={setPhotoIndex}
          open={fullscreen}
          onOpenChange={setFullscreen}
          onDownload={(photo) => photo.file && download.mutate(photo.file)}
          isDownloading={download.isPending && download.variables?.id === gallery[photoIndex]?.file?.id}
        />
      )}
    </Card>
  );
}

/** A card's shape while the list loads. */
export function AiActionReviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Box className="flex justify-between gap-3">
          <Box className="flex-1 space-y-2">
            <Box className="flex gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-36" />
            </Box>
            <Skeleton className="h-5 w-3/4" />
          </Box>
          <Skeleton className="h-8 w-24" />
        </Box>
        <Row className="gap-y-4">
          <Col lg={7} className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </Col>
          <Col lg={5}>
            <Skeleton className="aspect-[4/3] w-full" />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
