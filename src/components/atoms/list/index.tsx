import type { ComponentProps } from "react";

export function List(props: ComponentProps<"ul">) {
  return <ul {...props} />;
}

export function ListItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}
