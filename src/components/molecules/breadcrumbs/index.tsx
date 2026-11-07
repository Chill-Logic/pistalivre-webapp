import { ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Nav } from "@/components/atoms/landmarks";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";

type Crumb = { label: string; path: string | null };

/** Trail of folders; the current one (path null) is plain text. */
export function Breadcrumbs({
  crumbs,
  onOpen,
}: {
  crumbs: Crumb[];
  onOpen: (path: string) => void;
}) {
  return (
    <Nav aria-label="Caminho">
      <List className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => (
          <ListItem
            key={`${crumb.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index > 0 && (
              <ChevronRight
                className="size-4 text-muted-foreground"
                aria-hidden
              />
            )}
            {crumb.path === null ? (
              <Text weight="medium" aria-current="page">
                {crumb.label}
              </Text>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="h-auto px-0 text-muted-foreground md:h-auto"
                onClick={() => onOpen(crumb.path ?? "")}
              >
                {crumb.label}
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Nav>
  );
}
