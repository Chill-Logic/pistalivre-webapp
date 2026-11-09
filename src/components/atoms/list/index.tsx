import type { ComponentProps } from "react";

export function List(props: ComponentProps<"ul">) {
  return <ul {...props} />;
}

export function OrderedList(props: ComponentProps<"ol">) {
  return <ol {...props} />;
}

export function ListItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}
