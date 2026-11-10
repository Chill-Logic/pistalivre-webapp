import type { Config, Data } from "@puckeditor/core";
import { Box } from "@/components/atoms/box";
import { LandingCatalogBlock, type LandingCatalogProps } from "@/components/organisms/landing-catalog-block";
import { CATALOG_NOT_FOUND } from "@/constants/landing";
import { LandingFaqBlock, type LandingFaqProps } from "@/components/organisms/landing-faq-block";
import { LandingHeroBlock, type LandingHeroProps } from "@/components/organisms/landing-hero-block";
import { LandingLeadCtaBlock, type LandingLeadCtaProps } from "@/components/organisms/landing-lead-cta-block";
import { LandingPlansBlock, type LandingPlansProps } from "@/components/organisms/landing-plans-block";

type LandingBlocks = {
  Destaque: LandingHeroProps;
  Catalogo: LandingCatalogProps;
  Planos: LandingPlansProps;
  QueroAlugar: LandingLeadCtaProps;
  Perguntas: LandingFaqProps;
};

/**
 * The blocks the landing is built from: our own components, two of them fed
 * by the system (catalogue and plans), so nobody types a price twice.
 */
export const landingConfig: Config<LandingBlocks> = {
  root: {
    fields: { title: { type: "text", label: "Título da página (aba do navegador)" } },
    defaultProps: { title: "Pista Livre · aluguel de veículos" },
    // The landing is light-only (the brand page), whatever the app's theme.
    render: ({ children }) => (
      <Box className="theme-light min-h-full bg-background text-foreground">{children}</Box>
    ),
  },
  categories: {
    conteudo: { title: "Conteúdo", components: ["Destaque", "QueroAlugar", "Perguntas"] },
    sistema: { title: "Do sistema", components: ["Catalogo", "Planos"] },
  },
  components: {
    Destaque: {
      label: "Destaque",
      fields: {
        title: { type: "text", label: "Título" },
        subtitle: { type: "textarea", label: "Subtítulo" },
        imageUrl: { type: "text", label: "Imagem (link https)" },
        buttonLabel: { type: "text", label: "Texto do botão" },
        target: {
          type: "radio",
          label: "O botão leva para",
          options: [
            { label: "Quero alugar", value: "lead" },
            { label: "WhatsApp", value: "whatsapp" },
          ],
        },
        align: {
          type: "radio",
          label: "Alinhamento",
          options: [
            { label: "Texto à esquerda", value: "left" },
            { label: "Centralizado", value: "center" },
          ],
        },
      },
      defaultProps: {
        title: "Alugue seu veículo e comece a rodar hoje",
        subtitle: "Planos semanais e mensais, manutenção inclusa e atendimento de verdade.",
        imageUrl: "",
        buttonLabel: "Quero alugar",
        target: "lead",
        align: "left",
      },
      render: (props) => <LandingHeroBlock {...props} />,
    },
    Catalogo: {
      label: "Catálogo",
      fields: {
        title: { type: "text", label: "Título" },
        onlyAvailable: {
          type: "radio",
          label: "Mostrar",
          options: [
            { label: "Todos os ativos", value: false },
            { label: "Só com disponíveis", value: true },
          ],
        },
        max: { type: "number", label: "Máximo de veículos", min: 1, max: 24 },
        showAvailability: {
          type: "radio",
          label: "Disponibilidade nos cards",
          options: [
            { label: "Esconder", value: false },
            { label: "Mostrar", value: true },
          ],
        },
        notFoundTitle: { type: "text", label: "\"Não encontrou?\": título (vazio esconde)" },
        notFoundText: { type: "textarea", label: "\"Não encontrou?\": texto" },
        notFoundButton: { type: "text", label: "\"Não encontrou?\": botão" },
      },
      defaultProps: {
        title: "Nossa frota",
        onlyAvailable: false,
        max: 6,
        showAvailability: false,
        notFoundTitle: CATALOG_NOT_FOUND.title,
        notFoundText: CATALOG_NOT_FOUND.text,
        notFoundButton: CATALOG_NOT_FOUND.button,
      },
      render: (props) => <LandingCatalogBlock {...props} />,
    },
    Planos: {
      label: "Planos",
      fields: {
        title: { type: "text", label: "Título" },
        showHighlights: {
          type: "radio",
          label: "O que está incluso",
          options: [
            { label: "Esconder", value: false },
            { label: "Mostrar", value: true },
          ],
        },
      },
      defaultProps: { title: "Escolha o seu plano", showHighlights: false },
      render: (props) => <LandingPlansBlock {...props} />,
    },
    QueroAlugar: {
      label: "Chamada “Quero alugar”",
      fields: {
        title: { type: "text", label: "Título" },
        text: { type: "textarea", label: "Texto" },
        buttonLabel: { type: "text", label: "Texto do botão" },
        mode: {
          type: "radio",
          label: "Como abre",
          options: [
            { label: "Formulário na página", value: "inline" },
            { label: "Só o botão", value: "button" },
          ],
        },
      },
      defaultProps: {
        title: "Pronto para começar?",
        text: "Deixe seu contato e responda algumas perguntas rápidas: leva 2 minutos.",
        buttonLabel: "Quero alugar",
        mode: "inline",
      },
      render: (props) => <LandingLeadCtaBlock {...props} />,
    },
    Perguntas: {
      label: "Perguntas frequentes",
      fields: {
        title: { type: "text", label: "Título" },
        items: {
          type: "array",
          label: "Perguntas",
          getItemSummary: (item) => item.question || "Pergunta",
          defaultItemProps: { question: "Nova pergunta", answer: "Resposta" },
          arrayFields: {
            question: { type: "text", label: "Pergunta" },
            answer: { type: "textarea", label: "Resposta" },
          },
        },
      },
      defaultProps: { title: "Perguntas frequentes", items: [] },
      render: (props) => <LandingFaqBlock {...props} />,
    },
  },
};

/** First draft: the five blocks, already in place. */
export const LANDING_INITIAL_DATA: Data = {
  root: { props: {} },
  content: [
    { type: "Destaque", props: { id: "destaque-1", ...landingConfig.components.Destaque.defaultProps } },
    { type: "Catalogo", props: { id: "catalogo-1", ...landingConfig.components.Catalogo.defaultProps } },
    { type: "Planos", props: { id: "planos-1", ...landingConfig.components.Planos.defaultProps } },
    { type: "QueroAlugar", props: { id: "quero-alugar-1", ...landingConfig.components.QueroAlugar.defaultProps } },
    {
      type: "Perguntas",
      props: {
        id: "perguntas-1",
        title: "Perguntas frequentes",
        items: [
          { question: "Preciso ter CNH?", answer: "Sim, CNH válida na categoria do veículo." },
          { question: "A manutenção está inclusa?", answer: "Depende do plano: os itens inclusos aparecem em cada um." },
          { question: "Como pago?", answer: "Por pix ou boleto, na recorrência do seu plano." },
        ],
      },
    },
  ],
};
