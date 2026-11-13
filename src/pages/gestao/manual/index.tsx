import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Skeleton } from "@/components/atoms/skeleton";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ManualArticle } from "@/components/organisms/manual-article";
import { ManualIndex } from "@/components/organisms/manual-index";
import { QueryError } from "@/components/organisms/query-error";
import { useGuide } from "@/hooks/api/gestao/guide/useGuide";
import { useCopy } from "@/hooks/ui/useCopy";
import { guideChapters, guideNeighbours } from "@/utils/guide";

const SECTION_PARAM = "secao";

function ManualSkeleton() {
  return (
    <SkeletonRegion>
      <Row className="gap-y-6">
        <Col span={12} lg={3} className="hidden space-y-4 lg:block">
          <Skeleton className="h-11 w-full" />
          {Array.from({ length: 4 }, (_, i) => (
            <Box key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </Box>
          ))}
        </Col>
        <Col span={12} lg={9}>
          <Card>
            <CardContent className="space-y-6 p-6 md:p-10">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-3/4" />
              {Array.from({ length: 3 }, (_, i) => (
                <Box key={i} className="flex gap-4">
                  <Skeleton className="size-7 shrink-0" />
                  <Skeleton className="h-16 flex-1" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Col>
      </Row>
    </SkeletonRegion>
  );
}

/**
 * "Manual": the same manual the assistant and the Ctrl+K read, for the team
 * to browse, docs style — chapters and sections on the left (a search on
 * top), the open section on the right as numbered steps. Each section has its
 * own address (`?secao=`), to send to a colleague.
 */
export function ManualPage() {
  const guide = useGuide();
  const copy = useCopy();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const chapters = useMemo(
    () => guideChapters(guide.data?.areas ?? [], guide.data?.sections ?? [], query),
    [guide.data, query],
  );
  const sections = guide.data?.sections ?? [];
  const wanted = params.get(SECTION_PARAM);
  const current = sections.find((s) => s.id === wanted) ?? sections[0];
  const { previous, next } = guideNeighbours(sections, current?.id ?? "");
  const visible = chapters.flatMap((c) => c.sections);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [current?.id]);

  const pick = (id: string) => setParams({ [SECTION_PARAM]: id });
  const copyLink = () => {
    if (!current) return;
    const url = new URL(window.location.href);
    url.search = `?${SECTION_PARAM}=${current.id}`;
    void copy(url.toString(), "Link da seção copiado");
  };

  return (
    <Box className="space-y-4">
      <PageHeader title="Manual" />
      {guide.isError ? (
        <QueryError error={guide.error} onRetry={() => guide.refetch()} />
      ) : !guide.data || !current ? (
        <ManualSkeleton />
      ) : (
        <Row className="gap-y-4">
          <Col span={12} className="space-y-3 lg:hidden">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no manual"
              aria-label="Buscar no manual"
            />
            <Select
              value={visible.some((s) => s.id === current.id) ? current.id : ""}
              onValueChange={pick}
            >
              <SelectTrigger aria-label="Seção do manual">
                <SelectValue
                  placeholder={visible.length ? "Escolha a seção" : "Nada com essas palavras"}
                />
              </SelectTrigger>
              <SelectContent>
                {visible.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.area} · {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Col>
          <Col span={12} lg={3} className="hidden lg:block">
            <Box className="scrollbar-quiet sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6 pr-2">
              <ManualIndex
                chapters={chapters}
                activeId={current.id}
                query={query}
                onQuery={setQuery}
                onPick={pick}
              />
            </Box>
          </Col>
          <Col span={12} lg={9}>
            <Card>
              <CardContent className="p-5 md:p-10">
                <Box className="mx-auto max-w-3xl">
                  <ManualArticle
                    section={current}
                    previous={previous}
                    next={next}
                    onPick={pick}
                    onCopyLink={copyLink}
                  />
                </Box>
              </CardContent>
            </Card>
          </Col>
        </Row>
      )}
    </Box>
  );
}
