import type { QueryKey } from "@tanstack/react-query";
import { Box } from "@/components/atoms/box";
import { AttachmentChip } from "@/components/molecules/attachment-chip";
import { DocumentUploadDialog } from "@/components/organisms/document-upload-dialog";
import { ManageDocumentActions } from "@/components/organisms/documents-card";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentAttachment, DocumentOwner } from "@/types/document";

type RecordAttachmentsProps = {
  /** The charge (PAYMENT) or the customer's debt (CUSTOMER_DEBT). */
  owner: DocumentOwner;
  attachments: DocumentAttachment[];
  /** The query that lists the record (refreshed after a change). */
  invalidate: QueryKey;
  /** Text of the attach button when there is nothing yet. */
  attachLabel?: string;
  /** false: only the files (the attach button lives elsewhere, a menu). */
  withAttach?: boolean;
};

/**
 * Files hung on a money record: the pix receipt, the signed note. Attaching
 * stays open after the charge is paid (the receipt usually comes later).
 */
export function RecordAttachments({
  owner,
  attachments,
  invalidate,
  attachLabel = "Anexar comprovante",
  withAttach = true,
}: RecordAttachmentsProps) {
  const { view, download } = useFileActions();
  if (!withAttach && attachments.length === 0) return null;

  return (
    <Box className="flex flex-wrap items-center gap-2">
      {attachments.map((attachment) => (
        <AttachmentChip
          key={attachment.id}
          attachment={attachment}
          onView={() => view.mutate(attachment)}
          onDownload={() => download.mutate(attachment)}
          isViewing={view.isPending && view.variables?.id === attachment.id}
          isDownloading={
            download.isPending && download.variables?.id === attachment.id
          }
          actions={
            <ManageDocumentActions
              document={attachment}
              owner={owner}
              invalidate={invalidate}
            />
          }
        />
      ))}
      {withAttach && (
        <AttachButton
          owner={owner}
          invalidate={invalidate}
          label={attachments.length > 0 ? "Anexar mais" : attachLabel}
        />
      )}
    </Box>
  );
}

/** The "Anexar comprovante" button alone (e.g. inside a charge's menu). */
export function AttachButton({
  owner,
  invalidate,
  label = "Anexar comprovante",
}: {
  owner: DocumentOwner;
  invalidate: QueryKey;
  label?: string;
}) {
  return (
    <DocumentUploadDialog
      owner={owner}
      invalidate={invalidate}
      triggerLabel={label}
    />
  );
}
