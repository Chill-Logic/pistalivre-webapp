import type { ComponentProps } from "react";

/**
 * The browser's audio engine WITHOUT its controls (those are drawn by the
 * browser and look different everywhere): the AudioPlayer draws ours.
 */
export function Audio(props: Omit<ComponentProps<"audio">, "controls">) {
  return <audio preload="metadata" hidden {...props} />;
}
