import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import type { ListView } from "@/constants/pagination";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

const VIEW_PARAM = "visao";

/**
 * Cards or table, in the URL (`?visao=`), on the desktop only (table when
 * not chosen). The phone always shows cards, with no choice offered.
 */
export function useListView() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [params, setParams] = useSearchParams();
  const chosen = params.get(VIEW_PARAM);
  const view: ListView = !isDesktop
    ? "lista"
    : chosen === "lista" || chosen === "tabela"
      ? chosen
      : "tabela";

  const setView = useCallback(
    (next: ListView) =>
      setParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set(VIEW_PARAM, next);
          return params;
        },
        { replace: true },
      ),
    [setParams],
  );

  return { view, setView, isDesktop };
}
