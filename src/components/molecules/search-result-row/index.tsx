import type { LucideIcon } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Highlight } from "@/components/atoms/highlight";
import { Text } from "@/components/atoms/text";

type SearchResultRowProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  tokens: string[];
  /** Right side ("Tela", "Ação", "Enter"). */
  aside?: string;
};

/** One line of the search: icon, title with the match in bold, subtitle and snippet. */
export function SearchResultRow({ icon: Icon, title, subtitle, snippet, tokens, aside }: SearchResultRowProps) {
  return (
    <Box className="flex min-w-0 flex-1 items-start gap-3">
      <Box className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground md:size-7">
        <Icon className="size-4" aria-hidden />
      </Box>
      <Box className="min-w-0 flex-1">
        <Text truncate className="leading-snug">
          <Highlight text={title} tokens={tokens} />
        </Text>
        {subtitle && (
          <Text size="xs" tone="muted" truncate>
            <Highlight text={subtitle} tokens={tokens} />
          </Text>
        )}
        {snippet && (
          <Text size="xs" tone="muted" className="line-clamp-2 italic">
            <Highlight text={snippet} tokens={tokens} />
          </Text>
        )}
      </Box>
      {aside && (
        <Text size="xs" tone="muted" className="hidden shrink-0 self-center md:block">
          {aside}
        </Text>
      )}
    </Box>
  );
}
