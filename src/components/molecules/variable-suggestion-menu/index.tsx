import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { Text } from "@/components/atoms/text";
import type { VariableOption } from "@/helpers/template-variables";

export type VariableSuggestionMenuHandle = {
  /** Keys typed in the editor; true = the menu used it. */
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type VariableSuggestionMenuProps = {
  /** Already filtered by what was typed after `{{`. */
  options: VariableOption[];
  onPick: (option: VariableOption) => void;
  ref?: Ref<VariableSuggestionMenuHandle>;
};

/**
 * The `{{` menu. The caret stays in the editor, so there is no search box:
 * the editor routes ↑/↓/Home/End/Enter/Tab here through `ref`.
 * Remount it (`key`) when the query changes to start from the first item.
 */
export function VariableSuggestionMenu({
  options,
  onPick,
  ref,
}: VariableSuggestionMenuProps) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === activeId),
  );

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!options.length) return false;
      const move = (index: number) => setActiveId(options[index].id);
      switch (event.key) {
        case "ArrowDown":
          move((activeIndex + 1) % options.length);
          return true;
        case "ArrowUp":
          move((activeIndex - 1 + options.length) % options.length);
          return true;
        case "Home":
          move(0);
          return true;
        case "End":
          move(options.length - 1);
          return true;
        case "Enter":
        case "Tab":
          onPick(options[activeIndex]);
          return true;
        default:
          return false; // Escape belongs to the suggestion plugin
      }
    },
    [options, activeIndex, onPick],
  );

  useImperativeHandle(ref, () => ({ onKeyDown: handleKey }), [handleKey]);

  // Like an IDE: the highlighted item stays in view. Found by its value,
  // because cmdk marks `data-selected` only after this runs.
  const activeValue = options[activeIndex]?.id;
  useLayoutEffect(() => {
    if (!activeValue) return;
    listRef.current
      ?.querySelector(`[data-value="${CSS.escape(activeValue)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeValue]);

  const groups = options.reduce<{ label: string; items: VariableOption[] }[]>(
    (acc, option) => {
      const last = acc[acc.length - 1];
      if (last?.label === option.group) last.items.push(option);
      else acc.push({ label: option.group, items: [option] });
      return acc;
    },
    [],
  );

  return (
    <Command
      shouldFilter={false}
      value={options[activeIndex]?.id ?? ""}
      onValueChange={setActiveId}
    >
      <CommandList ref={listRef} className="max-h-72">
        {/* Not CommandEmpty: cmdk shows it for a frame on every remount,
            before the items register (it flashed at each keystroke). */}
        {options.length === 0 && (
          <Text tone="muted" className="py-6 text-center">
            Nenhuma variável com esse nome.
          </Text>
        )}
        {groups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((option) => (
              <CommandItem
                key={option.id}
                value={option.id}
                onSelect={() => onPick(option)}
              >
                <Text inline size={null} className="min-w-0 flex-1 truncate">
                  {option.label}
                </Text>
                <Text inline size="xs" tone="muted" mono truncate>
                  {option.hint}
                </Text>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
