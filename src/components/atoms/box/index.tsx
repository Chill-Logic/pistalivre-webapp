import type { ComponentProps } from "react";

/** Generic layout container. Every grouping outside atoms goes through it. */
export function Box(props: ComponentProps<"div">) {
  return <div {...props} />;
}
