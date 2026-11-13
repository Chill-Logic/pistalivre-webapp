import { ArrowLeft, BookOpen, ChevronRight, Clock, Search, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/atoms/dialog";
import { Kbd } from "@/components/atoms/kbd";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SearchPreview } from "@/components/molecules/search-preview";
import { SearchResultRow } from "@/components/molecules/search-result-row";
import { ROUTES } from "@/constants/routes";
import {
  SEARCH_ACTIONS,
  SEARCH_HINTS,
  SEARCH_TYPE_ICONS,
  SEARCH_TYPE_SINGULAR,
  SUGGESTED_ACTION_IDS,
  type SearchAction,
} from "@/constants/search";
import { urlOnRealmHost } from "@/helpers/host-realm";
import { searchNav } from "@/helpers/nav-search";
import {
  clearRecentSearches,
  forgetSearch,
  highlightTokens,
  readRecentSearches,
  rememberSearch,
  searchActions,
  searchTargetPath,
  startsWithQuery,
} from "@/helpers/search";
import { useUniversalSearch } from "@/hooks/api/gestao/search/useUniversalSearch";
import { useCopy } from "@/hooks/ui/useCopy";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useNavItems } from "@/hooks/ui/useNavItems";
import { searchPalette, useSearchPaletteOpen } from "@/hooks/ui/useSearchPalette";
import { useSearchShortcut } from "@/hooks/ui/useSearchShortcut";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";
import type { AuthUser } from "@/types/auth";
import type { SearchEntityType, SearchGuideSection, SearchResultItem } from "@/types/search";
import { cn } from "@/utils/cn";

/** One selectable line, whatever it is (record, screen, action, manual, recent). */
type PaletteItem = {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  aside?: string;
  /** Preview (desktop column). */
  kind: string;
  details?: { label: string; value: string }[];
  text?: string | null;
  actionLabel?: string;
  run: () => void;
  /** A recent search can be forgotten one by one. */
  remove?: { label: string; run: () => void };
};

type PaletteSection = { key: string; heading: string; items: PaletteItem[] };

const DEBOUNCE_MS = 150;

const QUESTION = /^(como|onde|qual|quais|o que|cad[eê]|posso|d[aá] pra|quero|preciso)(\s|$)/i;
const isQuestion = (q: string) => QUESTION.test(q.trim());

type SearchPaletteProps = { user: AuthUser };

/**
 * The universal search of the gestão (Ctrl+K, "/" or the search button):
 * one box for records (server index: patterns + text, grouped in the owner's
 * order), screens of the menu, actions and the manual. Keyboard first (↑/↓,
 * Enter, Esc); on desktop a preview column of the chosen result, on the phone
 * a full-screen list.
 */
export function SearchPalette({ user }: SearchPaletteProps) {
  useSearchShortcut();
  const open = useSearchPaletteOpen();
  const navigate = useNavigate();
  const copy = useCopy();
  const navItems = useNavItems();
  const { isAdmin } = useUserPermissions();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [onlyType, setOnlyType] = useState<{ type: SearchEntityType; label: string } | null>(null);
  const [reading, setReading] = useState<SearchGuideSection | null>(null);
  const [selected, setSelected] = useState("");
  const [recent, setRecent] = useState<string[]>(() => readRecentSearches(user.id));
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  const search = useUniversalSearch(
    {
      q: debounced,
      types: onlyType ? [onlyType.type] : undefined,
      perGroup: onlyType ? 50 : 5,
    },
    open,
  );
  const tokens = useMemo(() => highlightTokens(debounced), [debounced]);

  // A fresh box every time it opens.
  useEffect(() => {
    if (open) {
      setRecent(readRecentSearches(user.id));
      return;
    }
    setQuery("");
    setOnlyType(null);
    setReading(null);
  }, [open, user.id]);

  useEffect(() => setReading(null), [query]);

  const close = () => searchPalette.close();
  const go = (path: string) => {
    if (query.trim()) setRecent(rememberSearch(user.id, query));
    close();
    navigate(path);
  };

  const runAction = (action: SearchAction) => {
    if (action.run === "copyPreRegistrationLink") {
      void copy(urlOnRealmHost("cliente", ROUTES.portalPreRegistration), "Link do pré-cadastro copiado");
      close();
      return;
    }
    if (action.to) go(action.to);
  };

  const actionItem = (action: SearchAction): PaletteItem => ({
    key: `action:${action.id}`,
    icon: action.icon,
    title: action.label,
    aside: "Ação",
    kind: "Ação",
    actionLabel: action.run ? "Copiar link" : "Abrir",
    run: () => runAction(action),
  });

  const sections = useMemo<PaletteSection[]>(() => {
    const q = query.trim();
    if (!q) {
      const out: PaletteSection[] = [];
      if (recent.length > 0) {
        out.push({
          key: "recent",
          heading: "Buscas recentes",
          items: recent.map((r) => ({
            key: `recent:${r}`,
            icon: Clock,
            title: r,
            kind: "Busca recente",
            run: () => setQuery(r),
            remove: {
              label: `Apagar “${r}” das buscas recentes`,
              run: () => {
                setRecent(forgetSearch(user.id, r));
                // Back to the box: the next keystroke is a search, not lost on the "×".
                inputRef.current?.focus();
              },
            },
          })),
        });
      }
      out.push({
        key: "suggested",
        heading: "Atalhos",
        items: SUGGESTED_ACTION_IDS.map((id) => SEARCH_ACTIONS.find((a) => a.id === id))
          .filter((a): a is SearchAction => Boolean(a))
          .map(actionItem),
      });
      return out;
    }

    const out: PaletteSection[] = [];
    const data = search.data;
    const recordItem = (item: SearchResultItem): PaletteItem => {
      const path = searchTargetPath(item);
      return {
        key: `${item.type}:${item.id}`,
        icon: SEARCH_TYPE_ICONS[item.type],
        title: item.title,
        subtitle: item.subtitle,
        snippet: item.snippet,
        kind: SEARCH_TYPE_SINGULAR[item.type],
        details: item.details,
        actionLabel: path ? "Abrir" : undefined,
        run: () => path && go(path),
      };
    };

    if (onlyType) {
      const group = data?.groups.find((g) => g.key === onlyType.type || g.key === "shortcut");
      if (group) out.push({ key: group.key, heading: group.label, items: group.items.map(recordItem) });
      return out;
    }

    const screens = searchNav(navItems, q).map(({ item, group }) => ({
      key: `screen:${item.to}`,
      icon: item.icon,
      title: group ? `${group} › ${item.label}` : item.label,
      aside: "Tela",
      kind: "Tela",
      actionLabel: "Abrir",
      label: item.label,
      run: () => go(item.to),
    }));
    const actions = searchActions(q, isAdmin).map((a) => ({ ...actionItem(a), label: a.label }));
    const strong = [...screens, ...actions].filter((i) => startsWithQuery(i.label, q) || startsWithQuery(i.title, q));
    const weak = [...screens, ...actions].filter((i) => !strong.includes(i));

    const shortcut = data?.groups.find((g) => g.key === "shortcut");
    if (shortcut) out.push({ key: "shortcut", heading: shortcut.label, items: shortcut.items.map(recordItem) });
    if (strong.length > 0) out.push({ key: "local-strong", heading: "Telas e ações", items: strong });
    for (const group of data?.groups ?? []) {
      if (group.key === "shortcut") continue;
      const items = group.items.map(recordItem);
      if (group.total > group.items.length) {
        const type = group.key;
        items.push({
          key: `more:${type}`,
          icon: ChevronRight,
          title: `Ver todos os ${group.total} em ${group.label}`,
          kind: group.label,
          run: () => {
            setOnlyType({ type, label: group.label });
            setSelected("");
          },
        });
      }
      out.push({ key: group.key, heading: group.label, items });
    }
    if (weak.length > 0) out.push({ key: "local-weak", heading: "Mais telas e ações", items: weak });
    if (data?.guide.length) {
      // "como gero o contrato?" is a question: the manual answers it, on top.
      const place = isQuestion(q) ? (shortcut ? 1 : 0) : out.length;
      out.splice(place, 0, {
        key: "guide",
        heading: "Manual",
        items: data.guide.map((section) => ({
          key: `guide:${section.id}`,
          icon: BookOpen,
          title: section.title,
          aside: "Manual",
          kind: "Manual",
          text: section.text,
          run: () => setReading(section),
        })),
      });
    }
    return out;
    // `go`/`actionItem` are stable enough per render; recomputing on their identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, recent, search.data, onlyType, navItems, isAdmin, user.id]);

  const allItems = sections.flatMap((s) => s.items);
  // The list changes under the selection while typing: fall back to the first line.
  const current = allItems.find((i) => i.key === selected) ?? allItems[0];
  const activeKey = current?.key ?? "";
  const typing = query.trim().length > 0;
  const waiting = typing && (debounced !== query.trim() || search.isFetching);
  const firstLoad = typing && !search.data && (search.isLoading || debounced !== query.trim());
  const nothing = typing && !waiting && !search.isError && allItems.length === 0;

  return (
    <Dialog open={open} onOpenChange={searchPalette.set}>
      <DialogContent
        aria-describedby={undefined}
        className="top-0 flex h-dvh flex-col gap-0 space-y-0 overflow-hidden rounded-none p-0 sm:top-[10vh] sm:h-auto sm:max-h-[76vh] sm:max-w-3xl sm:-translate-y-0 sm:rounded-xl sm:p-0"
      >
        <DialogTitle className="sr-only">Buscar no sistema</DialogTitle>
        <DialogDescription className="sr-only">
          Clientes, locações, cobranças, veículos, telas, ações e o manual.
        </DialogDescription>
        <Command shouldFilter={false} loop value={activeKey} onValueChange={setSelected} className="flex min-h-0 flex-1 flex-col bg-card">
          <Box className="flex items-center gap-1 border-b pr-2 pt-safe-t">
            <Box className="min-w-0 flex-1 [&>div]:border-b-0">
              <CommandInput
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar cliente, placa, LOC-, valor, data, tela…"
                aria-label="Buscar"
                autoFocus
              />
            </Box>
            {onlyType && (
              <Badge variant="neutral" className="shrink-0 gap-1">
                Só {onlyType.label}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Buscar em tudo"
                  onClick={() => setOnlyType(null)}
                  className="size-5 md:size-5"
                >
                  <X className="!size-3" />
                </Button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={close} className="shrink-0 md:hidden">
              Cancelar
            </Button>
            <Kbd className="hidden md:inline-flex">Esc</Kbd>
          </Box>
          <Box className="h-0.5">{waiting && search.data && <ProgressBar />}</Box>

          {reading ? (
            <Box className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 md:p-5">
              <Box>
                <Button variant="ghost" size="sm" onClick={() => setReading(null)} className="-ml-2">
                  <ArrowLeft />
                  Voltar aos resultados
                </Button>
              </Box>
              <SearchPreview icon={BookOpen} kind="Manual" title={reading.title} text={reading.text} />
            </Box>
          ) : (
            <Box className="flex min-h-0 flex-1">
              <Box className="flex min-h-0 min-w-0 flex-1 flex-col md:basis-7/12">
                <CommandList
                  className={cn(
                    "scrollbar-quiet max-h-none min-h-0 flex-1 p-2 transition-opacity md:max-h-[60vh]",
                    waiting && search.data && "opacity-60",
                  )}
                >
                  {firstLoad ? (
                    <SearchPaletteSkeleton />
                  ) : (
                    sections.map((section) => (
                      <CommandGroup key={section.key} heading={section.heading}>
                        {section.items.map((item) => (
                          <CommandItem key={item.key} value={item.key} onSelect={item.run} className="py-2 md:py-1.5">
                            <SearchResultRow
                              icon={item.icon}
                              title={item.title}
                              subtitle={item.subtitle}
                              snippet={item.snippet}
                              tokens={tokens}
                              aside={item.aside}
                              onRemove={item.remove?.run}
                              removeLabel={item.remove?.label}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))
                  )}
                  {nothing && (
                    <Box className="space-y-2 px-3 py-8 text-center">
                      <Text weight="medium">Nada encontrado para “{query.trim()}”.</Text>
                      <Text size="xs" tone="muted">
                        Tente só o sobrenome, a placa, o código LOC- ou o valor (ex.: 130,16).
                      </Text>
                    </Box>
                  )}
                  {typing && search.isError && !search.data && (
                    <Text tone="destructive" className="px-3 py-8 text-center">
                      Não foi possível buscar agora. Tente de novo em instantes.
                    </Text>
                  )}
                  {!typing && (
                    <Box className="space-y-2 px-2 pb-2 pt-3">
                      <Text size="xs" tone="muted">
                        Também acha por:
                      </Text>
                      <Box className="flex flex-wrap gap-1.5">
                        {SEARCH_HINTS.map((hint) => (
                          <Badge key={hint} variant="outline">
                            {hint}
                          </Badge>
                        ))}
                      </Box>
                      {recent.length > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto px-0 text-xs md:h-auto"
                          onClick={() => {
                            clearRecentSearches(user.id);
                            setRecent([]);
                          }}
                        >
                          Limpar buscas recentes
                        </Button>
                      )}
                    </Box>
                  )}
                </CommandList>
                <Box className="hidden items-center gap-3 border-t px-3 py-2 md:flex">
                  <Text size="xs" tone="muted" className="flex items-center gap-1">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd> escolher
                  </Text>
                  <Text size="xs" tone="muted" className="flex items-center gap-1">
                    <Kbd>Enter</Kbd> abrir
                  </Text>
                  <Text size="xs" tone="muted" className="flex items-center gap-1">
                    <Kbd>Esc</Kbd> fechar
                  </Text>
                </Box>
              </Box>
              {isDesktop && (
                <Box className="hidden min-h-0 basis-5/12 flex-col border-l bg-muted/30 p-5 md:flex">
                  {current && typing && !firstLoad ? (
                    <SearchPreview
                      icon={current.icon}
                      kind={current.kind}
                      title={current.title}
                      subtitle={current.subtitle}
                      details={current.details}
                      text={current.text}
                      actionLabel={current.text ? "Ler" : current.actionLabel}
                      onAction={current.run}
                    />
                  ) : (
                    <SearchPaletteIntro />
                  )}
                </Box>
              )}
            </Box>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/** Desktop preview column before anything is typed. */
function SearchPaletteIntro() {
  return (
    <Box className="space-y-3">
      <Box className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Search className="size-5" aria-hidden />
      </Box>
      <Text weight="semibold">Busca em todo o sistema</Text>
      <Text size="xs" tone="muted" className="leading-relaxed">
        Locações, cobranças, clientes, veículos, manutenções, documentos (até o texto dos recibos em PDF), telas,
        ações e o manual. Nome com erro de digitação também acha.
      </Text>
    </Box>
  );
}

/** First load: rows in the shape of the results. */
export function SearchPaletteSkeleton() {
  return (
    <Box className="space-y-4 p-2" aria-hidden>
      {[0, 1].map((group) => (
        <Box key={group} className="space-y-3">
          <Skeleton className="h-3 w-24" />
          {[0, 1, 2].map((row) => (
            <Box key={row} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-md md:size-7" />
              <Box className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

