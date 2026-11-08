import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DocumentItem } from "@/components/molecules/document-item";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { FileLink } from "@/types/document";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/text";

type AttachmentListProps = {
  files: FileLink[];
  /**
   * Hidden behind "Ver N fotos" until asked (e.g. the many photos of an
   * inspection). Singular and plural of what the files are.
   */
  collapsed?: { one: string; many: string };
};

/**
 * Files hanging off a row (a charge's receipt, a maintenance's invoice, an
 * inspection's photos), each with view and download.
 */
export function AttachmentList({ files, collapsed }: AttachmentListProps) {
  const { view, download } = useFileActions();
  const [expanded, setExpanded] = useState(!collapsed);

  if (files.length === 0) return null;

  return (
    <Box>
      {collapsed && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          <ChevronDown
            className={cn("transition-transform", expanded && "rotate-180")}
          />
          {expanded
            ? `Esconder ${collapsed.many}`
            : `Ver ${pluralize(files.length, collapsed.one, collapsed.many)}`}
        </Button>
      )}
      {expanded && (
        <Box className="divide-y rounded-md border px-3">
          {files.map((file) => (
            <DocumentItem
              key={file.id}
              document={file}
              onView={() => view.mutate(file)}
              onDownload={() => download.mutate(file)}
              isViewing={view.isPending && view.variables?.id === file.id}
              isDownloading={
                download.isPending && download.variables?.id === file.id
              }
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
