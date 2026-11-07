import type { ComponentProps } from "react";

/**
 * The browser's file input, always hidden: a button opens it (`ref.click()`),
 * so the native "Choose file / No file chosen" control never shows.
 */
export function FileInput(props: Omit<ComponentProps<"input">, "type">) {
  return <input type="file" className="sr-only" tabIndex={-1} {...props} />;
}
