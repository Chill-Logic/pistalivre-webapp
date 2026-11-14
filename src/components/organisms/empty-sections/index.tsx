import { useState, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { createEmptySectionsStore } from "@/helpers/empty-sections";
import {
  EmptySectionsContext,
  useEmptySections,
} from "@/hooks/ui/useEmptySection";

/**
 * Wraps a detail page: its empty sections (ListCard, CollapsibleCard with
 * nothing in them) gather in one "Ainda sem registros" card instead of a wall
 * of empty cards. Place <EmptySectionsCard /> where that card should go.
 */
export function EmptySectionsProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createEmptySectionsStore);
  return (
    <EmptySectionsContext.Provider value={store}>
      {children}
    </EmptySectionsContext.Provider>
  );
}

/** One line per empty section, with its own buttons; nothing when none. */
export function EmptySectionsCard() {
  const entries = useEmptySections();
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-1 md:pb-1">
        <CardTitle className="text-base">Ainda sem registros</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {entries.map((entry) => (
            <ListItem
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
            >
              <Box className="min-w-0 flex-1 basis-56">
                <Text weight="medium">{entry.title}</Text>
                <Box className="text-xs text-muted-foreground [&_p]:text-xs [&_p]:text-muted-foreground">
                  {entry.description}
                </Box>
              </Box>
              {entry.actions && (
                <Box className="flex shrink-0 flex-wrap gap-2">
                  {entry.actions}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
