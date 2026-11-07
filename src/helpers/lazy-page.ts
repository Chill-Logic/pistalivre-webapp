import { lazy, type ComponentType } from "react";

/**
 * Code-split a page that uses a named export. Each page becomes its own
 * chunk, so the first paint only downloads the screen being opened.
 */
export function lazyPage<Name extends string>(
  load: () => Promise<Record<Name, ComponentType>>,
  name: Name,
) {
  return lazy(() => load().then((module) => ({ default: module[name] })));
}
