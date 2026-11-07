import type { ComponentProps } from "react";

/** Page landmarks: keep the document semantic without raw tags upstream. */
export function Header(props: ComponentProps<"header">) {
  return <header {...props} />;
}

export function Main(props: ComponentProps<"main">) {
  return <main {...props} />;
}

export function Nav(props: ComponentProps<"nav">) {
  return <nav {...props} />;
}

export function Aside(props: ComponentProps<"aside">) {
  return <aside {...props} />;
}
