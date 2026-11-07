import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Spinner } from "@/components/atoms/spinner";
import {
  ALL_SELECT_VALUE,
  fromSelectValue,
  toSelectValue,
  type SelectOption,
} from "@/helpers/select";

type FilterSelectProps = {
  label: string;
  value: string;
  allLabel: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Options still loading: locked, with a spinner in the trigger. */
  isLoading?: boolean;
};

/** List filter: "all" + options; "" means no filter. */
export function FilterSelect({
  label,
  value,
  allLabel,
  options,
  onChange,
  isLoading = false,
}: FilterSelectProps) {
  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => onChange(fromSelectValue(next))}
    >
      <SelectTrigger
        aria-label={label}
        aria-busy={isLoading}
        disabled={isLoading}
      >
        <SelectValue />
        {isLoading && <Spinner className="ml-auto size-4" />}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_SELECT_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
