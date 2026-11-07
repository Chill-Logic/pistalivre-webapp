import { lazy, type ComponentType } from "react";

/**
 * Code-split a page that uses a named export. Each page becomes its own
 * chunk, so the first paint only downloads the screen being opened.
 * `preload()` fetches the chunk ahead of time (e.g. sibling tabs).
 */
export function lazyPage<Name extends string, Props extends object = object>(
  load: () => Promise<Record<Name, ComponentType<Props>>>,
  name: Name,
) {
  return Object.assign(
    lazy(() => load().then((module) => ({ default: module[name] }))),
    { preload: load },
  );
}
