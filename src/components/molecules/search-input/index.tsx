import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/atoms/input";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";

type SearchInputProps = {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
};

/** Types freely, fires `onSearch` only after the user pauses. */
export function SearchInput({
  value,
  onSearch,
  placeholder,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft);
  const lastValue = useRef(value);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Value changed from outside (back button, link): follow it.
  useEffect(() => {
    if (value === lastValue.current) return;
    lastValue.current = value;
    setDraft(value);
  }, [value]);

  // Emit only when the debounced draft itself changes, never because the
  // value moved — otherwise a stale draft would overwrite the URL.
  useEffect(() => {
    const next = debounced.trim();
    if (next === lastValue.current) return;
    lastValue.current = next;
    onSearchRef.current(next);
  }, [debounced]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        inputMode="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? "Buscar"}
        className="pl-9"
      />
    </div>
  );
}
