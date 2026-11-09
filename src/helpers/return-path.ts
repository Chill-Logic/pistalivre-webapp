/** `?voltar=`: only in-app paths (never another site). */
export function safeReturnPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;
}

/** `voltar` + `incluir=<id>`: the page that sent here picks the new record. */
export function withIncluded(path: string, id: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("incluir", id);
  return `${pathname}?${params.toString()}`;
}
