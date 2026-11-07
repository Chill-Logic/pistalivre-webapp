import type { ComponentProps } from "react";

/** `alt` is required: pass "" for decorative images. */
export function Image(props: ComponentProps<"img"> & { alt: string }) {
  return <img {...props} />;
}
