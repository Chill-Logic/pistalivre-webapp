import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import type { ListView } from "@/constants/pagination";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

const VIEW_PARAM = "visao";

/**
 * Cards or table, in the URL (`?visao=`). Without a choice: table on the
 * desktop, cards on the phone.
 */
export function useListView() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [params, setParams] = useSearchParams();
  const chosen = params.get(VIEW_PARAM);
  const fallback: ListView = isDesktop ? "tabela" : "lista";
  const view: ListView =
    chosen === "lista" || chosen === "tabela" ? chosen : fallback;

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
