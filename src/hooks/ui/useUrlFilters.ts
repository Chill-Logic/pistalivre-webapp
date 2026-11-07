import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { parsePage, parsePageSize } from "@/helpers/pagination";

const PAGE_PARAM = "pagina";
const PAGE_SIZE_PARAM = "por_pagina";

/**
 * List filters in the URL (Portuguese param names): shareable, survive refresh
 * and the back button. Any filter change goes back to page 1.
 */
export function useUrlFilters<Key extends string>(keys: readonly Key[]) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(
    () =>
      Object.fromEntries(
        keys.map((key) => [key, params.get(key) ?? ""]),
      ) as Record<Key, string>,
    // keys is a constant tuple per caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params],
  );

  const page = parsePage(params.get(PAGE_PARAM));
  const pageSize = parsePageSize(
    params.get(PAGE_SIZE_PARAM),
    DEFAULT_PAGE_SIZE,
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== PAGE_PARAM) next.delete(PAGE_PARAM);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setFilter = useCallback(
    (key: Key, value: string) => setParam(key, value),
    [setParam],
  );

  /** Several filters in one URL update (e.g. a date range). */
  const setFilters = useCallback(
    (next: Partial<Record<Key, string>>) => {
      setParams(
        (current) => {
          const params = new URLSearchParams(current);
          for (const [key, value] of Object.entries(next) as [
            string,
            string,
          ][]) {
            if (value) params.set(key, value);
            else params.delete(key);
          }
          params.delete(PAGE_PARAM);
          return params;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setPage = useCallback(
    (next: number) => setParam(PAGE_PARAM, next > 1 ? String(next) : ""),
    [setParam],
  );

  /** Changing the page size goes back to page 1 (like any filter). */
  const setPageSize = useCallback(
    (next: number) =>
      setParam(PAGE_SIZE_PARAM, next === DEFAULT_PAGE_SIZE ? "" : String(next)),
    [setParam],
  );

  return {
    values,
    page,
    pageSize,
    setFilter,
    setFilters,
    setPage,
    setPageSize,
  };
}
