import { SearchX } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { DocumentSearch } from "@/types/document-tree";

type DocumentSearchResultsProps = {
  search: DocumentSearch;
  onOpenFolder: (path: string) => void;
};

/** Matches across every owner, each with where it lives (tap to go there). */
export function DocumentSearchResults({
  search,
  onOpenFolder,
}: DocumentSearchResultsProps) {
  const { view, download } = useFileActions();

  if (search.results.length === 0) {
    return <EmptyState icon={SearchX} title="Nenhum documento encontrado" />;
  }

  return (
    <Card>
      <CardContent className="divide-y pt-1 md:pt-1">
        {search.results.map(({ document, location, path }) => (
          <Box key={document.id} className="pb-2">
            <DocumentItem
              document={document}
              onView={() => view.mutate(document)}
              onDownload={() => download.mutate(document)}
              isViewing={view.isPending && view.variables?.id === document.id}
              isDownloading={
                download.isPending && download.variables?.id === document.id
              }
            />
            <Button
              variant="link"
              size="sm"
              className="h-auto whitespace-normal px-0 text-left text-xs text-muted-foreground md:h-auto"
              onClick={() => onOpenFolder(path)}
            >
              {location}
            </Button>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
