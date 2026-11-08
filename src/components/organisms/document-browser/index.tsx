import { FolderOpen } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { FolderCard } from "@/components/molecules/folder-card";
import { ManagedDocumentList } from "@/components/organisms/managed-document-list";
import { queryKeys } from "@/constants/query-keys";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentTree } from "@/types/document-tree";
import { cn } from "@/utils/cn";

type DocumentBrowserProps = {
  tree: DocumentTree;
  onOpen: (path: string) => void;
  isRefreshing?: boolean;
};

/** One folder: its subfolders, or (in a category) its files. */
export function DocumentBrowser({
  tree,
  onOpen,
  isRefreshing = false,
}: DocumentBrowserProps) {
  const { view, download } = useFileActions();

  if (tree.folders.length === 0 && tree.files.length === 0) {
    return <EmptyState icon={FolderOpen} title="Pasta vazia" />;
  }

  return (
    <Box
      aria-busy={isRefreshing}
      className={cn(
        "space-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {tree.folders.length > 0 && (
        <Row as="ul" aria-label="Pastas" className="gap-y-3">
          {tree.folders.map((folder) => (
            <Col as="li" key={folder.path} md={6} xl={4}>
              <FolderCard
                label={folder.label}
                count={folder.count}
                onOpen={() => onOpen(folder.path)}
              />
            </Col>
          ))}
        </Row>
      )}
      {tree.files.length > 0 && (
        <Card>
          <CardContent className="pt-1 md:pt-1">
            {tree.owner ? (
              // A category folder: its owner's documents, managed here too.
              <ManagedDocumentList
                documents={tree.files}
                owner={tree.owner}
                invalidate={queryKeys.documents.all}
              />
            ) : (
              <Box className="divide-y">
                {tree.files.map((file) => (
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
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export function DocumentBrowserSkeleton() {
  return (
    <Row className="gap-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Col key={index} md={6} xl={4}>
          <Skeleton className="h-14" />
        </Col>
      ))}
    </Row>
  );
}
