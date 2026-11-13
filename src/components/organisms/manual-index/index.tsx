import { Search } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Text } from "@/components/atoms/text";
import type { GuideChapter } from "@/types/guide";
import { cn } from "@/utils/cn";

type ManualIndexProps = {
  chapters: GuideChapter[];
  activeId: string;
  query: string;
  onQuery: (query: string) => void;
  onPick: (id: string) => void;
};

/**
 * The manual's table of contents (desktop, sticky beside the article):
 * a search on top, then each chapter with its sections; the open one is
 * marked by the bar on the left, docs style.
 */
export function ManualIndex({ chapters, activeId, query, onQuery, onPick }: ManualIndexProps) {
  return (
    <Box className="space-y-6">
      <Box className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Buscar no manual"
          aria-label="Buscar no manual"
          className="pl-9"
        />
      </Box>
      {chapters.length === 0 ? (
        <Text tone="muted">Nada no manual com essas palavras.</Text>
      ) : (
        chapters.map((chapter) => (
          <Box key={chapter.area} className="space-y-2">
            <Text size="xs" tone="muted" weight="semibold" mono className="uppercase tracking-[0.18em]">
              {chapter.area}
            </Text>
            <Box className="border-l">
              {chapter.sections.map((section) => {
                const active = section.id === activeId;
                return (
                  <Button
                    key={section.id}
                    variant="ghost"
                    onClick={() => onPick(section.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-ml-px h-auto w-full justify-start whitespace-normal rounded-none border-l py-1.5 pl-4 pr-2 text-left font-normal leading-snug text-muted-foreground hover:bg-transparent hover:text-foreground md:h-auto",
                      active
                        ? "border-primary font-semibold text-foreground"
                        : "border-transparent hover:border-muted-foreground/50",
                    )}
                  >
                    {section.title}
                  </Button>
                );
              })}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}
