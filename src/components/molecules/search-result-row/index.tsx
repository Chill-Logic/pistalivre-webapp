import { X, type LucideIcon } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Highlight } from "@/components/atoms/highlight";
import { Text } from "@/components/atoms/text";

type SearchResultRowProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  tokens: string[];
  /** Right side ("Tela", "Ação", "Manual"). */
  aside?: string;
  /** A "×" that removes the line (a recent search), without opening it. */
  onRemove?: () => void;
  removeLabel?: string;
};

/**
 * One line of the search: icon, title with the match in bold, subtitle and
 * snippet. The icon is centered on the text block, one line or three.
 */
export function SearchResultRow({
  icon: Icon,
  title,
  subtitle,
  snippet,
  tokens,
  aside,
  onRemove,
  removeLabel = "Remover",
}: SearchResultRowProps) {
  return (
    <Box className="flex min-w-0 flex-1 items-center gap-3">
      <Box className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground md:size-7">
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
        <Text size="xs" tone="muted" className="hidden shrink-0 md:block">
          {aside}
        </Text>
      )}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={removeLabel}
          title={removeLabel}
          // The line underneath opens on click: this one only removes.
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          className="-my-1 size-8 shrink-0 text-muted-foreground hover:text-foreground md:size-7"
        >
          <X />
        </Button>
      )}
    </Box>
  );
}
