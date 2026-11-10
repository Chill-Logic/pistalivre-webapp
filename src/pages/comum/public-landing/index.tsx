import { Render } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useEffect } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Heading } from "@/components/atoms/heading";
import { Main } from "@/components/atoms/landmarks";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { landingConfig } from "@/components/organisms/landing-editor/config";
import { LEAD_CAPTURE_URL } from "@/constants/landing";
import { landingMeta } from "@/helpers/landing";
import { usePublicLanding } from "@/hooks/api/comum/public-site/usePublicSite";

function setMeta(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/**
 * pistalivrelocacoes.com.br: the published landing (the backend already wrote
 * the title and description in the HTML for search and sharing; this keeps
 * them in sync after loading). Nothing published yet: a short branded page.
 */
export function PublicLandingPage() {
  const site = usePublicLanding();
  const data = site.data?.data ?? null;

  useEffect(() => {
    if (!site.data) return;
    const meta = landingMeta(data);
    document.title = meta.title;
    setMeta("description", meta.description);
  }, [site.data, data]);

  if (site.isPending) {
    return (
      <Box className="min-h-dvh bg-background">
        <Skeleton className="h-72 rounded-none bg-[#8a0c11]/40" />
        <Box className="mx-auto max-w-6xl space-y-4 px-4 py-12">
          <Skeleton className="mx-auto h-8 w-72" />
          <Skeleton className="h-48" />
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Main className="theme-light flex min-h-dvh flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#E4141B] via-[#8a0c11] to-[#1a0507] px-6 text-center text-white">
        <Logo size="hero" />
        <Heading className="text-3xl md:text-4xl">{site.data?.company.name ?? "Pista Livre"}</Heading>
        <Text size="lg" className="text-white/85">
          Aluguel de veículos para quem trabalha com aplicativo.
        </Text>
        <Button asChild size="lg" variant="secondary">
          <ExternalLink href={LEAD_CAPTURE_URL} className="text-foreground hover:no-underline">
            Quero alugar
          </ExternalLink>
        </Button>
      </Main>
    );
  }

  return (
    <Main>
      <Render config={landingConfig} data={data} />
    </Main>
  );
}
