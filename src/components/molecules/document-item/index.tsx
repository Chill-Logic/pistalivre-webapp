import { Download, Eye, FileText, Image as ImageIcon, Mic } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { AudioPlayer } from "@/components/molecules/audio-player";
import { SignatureStatusBadge } from "@/components/molecules/signature-status-badge";
import { isAudioFile } from "@/helpers/files";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { ReactNode } from "react";
import type { FileLink } from "@/types/document";
import { cn } from "@/utils/cn";
import { formatDate, formatFileSize } from "@/utils/format";

type DocumentItemProps = {
  document: FileLink;
  /** Shown instead of the file name (e.g. the inspection photo's label). */
  title?: string;
  /** Replaces the kind · size · date line (e.g. a contract's status). */
  subtitle?: string;
  onView: () => void;
  onDownload: () => void;
  isViewing: boolean;
  isDownloading: boolean;
  /** Extra buttons after view/download (edit, delete). */
  actions?: ReactNode;
  /** A status tag beside the signature one (e.g. "Revogado"). */
  badge?: ReactNode;
  /** Present = a checkbox to pick it for a bulk action. */
  selection?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  };
};

export function DocumentItem({
  document,
  title,
  subtitle,
  onView,
  onDownload,
  isViewing,
  isDownloading,
  actions,
  badge,
  selection,
}: DocumentItemProps) {
  const audio = isAudioFile(document);
  const Icon = audio
    ? Mic
    : document.contentType?.startsWith("image/")
      ? ImageIcon
      : FileText;
  const meta = [
    document.category?.name,
    document.size !== undefined && formatFileSize(document.size),
    document.createdAt && formatDate(document.createdAt),
  ].filter(Boolean);

  return (
    <Box
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 py-3 md:flex-nowrap",
        selection?.checked && "-mx-2 rounded-md bg-primary/5 px-2",
      )}
    >
      {selection && (
        <Checkbox
          checked={selection.checked}
          onCheckedChange={(checked) =>
            selection.onCheckedChange(checked === true)
          }
          disabled={selection.disabled}
          aria-label={`Selecionar ${document.fileName}`}
        />
      )}
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <Box className="min-w-0 flex-1">
        <Text weight="medium" truncate>
          {title ?? document.fileName}
        </Text>
        <Text size="xs" tone="muted" truncate>
          {subtitle ?? meta.join(" · ")}
        </Text>
        {audio && <AudioPlayer file={document} className="mt-1 max-w-sm" />}
        {(badge || document.signature) && (
          <Box className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {badge}
            {document.signature && (
              <>
                <SignatureStatusBadge status={document.signature.status} />
                <TextLink
                  to={routeTo.signature(document.signature.requestId)}
                  className="text-xs"
                >
                  ver pedido
                </TextLink>
              </>
            )}
          </Box>
        )}
      </Box>
      {/* With the manage buttons, on the phone they go to their own line. */}
      <Box
        className={cn(
          "flex shrink-0 items-center justify-end",
          actions && "max-md:-mt-2 max-md:w-full max-md:pl-8",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          disabled={isViewing}
          aria-label={`Visualizar ${document.fileName}`}
        >
          {isViewing ? <Spinner /> : <Eye />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownload}
          disabled={isDownloading}
          aria-label={`Baixar ${document.fileName}`}
        >
          {isDownloading ? <Spinner /> : <Download />}
        </Button>
        {actions}
      </Box>
    </Box>
  );
}
