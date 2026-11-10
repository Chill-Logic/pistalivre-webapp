import type { Config, Data, Slot } from "@puckeditor/core";
import { Box } from "@/components/atoms/box";
import { LandingCatalogBlock, type LandingCatalogProps } from "@/components/organisms/landing-catalog-block";
import { LandingFaqBlock, type LandingFaqProps } from "@/components/organisms/landing-faq-block";
import { LandingHeroBlock, type LandingHeroProps } from "@/components/organisms/landing-hero-block";
import { LandingLeadCtaBlock, type LandingLeadCtaProps } from "@/components/organisms/landing-lead-cta-block";
import { LandingPlansBlock, type LandingPlansProps } from "@/components/organisms/landing-plans-block";
import { LandingColumnsBlock, type LandingColumnsProps } from "@/components/organisms/landing-columns-block";
import { LandingFeatureBlock, type LandingFeatureProps } from "@/components/organisms/landing-feature-block";
import { LandingSectionBlock, type LandingSectionProps } from "@/components/organisms/landing-section-block";
import { LandingTextBlock, type LandingTextProps } from "@/components/organisms/landing-text-block";
import { FEATURE_ICONS } from "@/constants/landing-icons";
import { sectionStyleFields, widthField } from "./fields";

/** Blocks holding others store their children as data (`Slot`). */
type SectionData = Omit<LandingSectionProps, "content"> & { content: Slot };
type ColumnsData = Omit<LandingColumnsProps, "col1" | "col2" | "col3" | "col4"> & {
  col1: Slot;
  col2: Slot;
  col3: Slot;
  col4: Slot;
};

type LandingBlocks = {
  Secao: SectionData;
  Colunas: ColumnsData;
  Texto: LandingTextProps;
  Vantagem: LandingFeatureProps;
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
    fields: {
      title: { type: "text", label: "Título da página (aba e Google)" },
      description: { type: "textarea", label: "Descrição (Google e compartilhamento no WhatsApp)" },
    },
    defaultProps: {
      title: "Pista Livre · aluguel de veículos",
      description: "Aluguel de motos e veículos para quem trabalha com aplicativo: planos semanais e mensais, manutenção inclusa.",
    },
    // The landing is light-only (the brand page), whatever the app's theme.
    render: ({ children }) => (
      <Box className="theme-light min-h-full bg-background text-foreground">{children}</Box>
    ),
  },
  categories: {
    layout: { title: "Layout", components: ["Secao", "Colunas"] },
    conteudo: {
      title: "Conteúdo",
      components: ["Destaque", "Texto", "Vantagem", "QueroAlugar", "Perguntas"],
    },
    sistema: { title: "Do sistema", components: ["Catalogo", "Planos"] },
  },
  components: {
    Secao: {
      label: "Seção",
      fields: {
        ...sectionStyleFields,
        width: widthField,
        content: { type: "slot" },
      },
      defaultProps: { background: "muted", spacing: "md", width: "normal", backgroundImage: "", content: [] },
      render: (props) => <LandingSectionBlock {...props} />,
    },
    Colunas: {
      label: "Colunas",
      fields: {
        columns: {
          type: "radio",
          label: "Colunas",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        },
        gap: {
          type: "radio",
          label: "Espaço entre linhas (celular)",
          options: [
            { label: "Pequeno", value: "sm" },
            { label: "Médio", value: "md" },
            { label: "Grande", value: "lg" },
          ],
        },
        align: {
          type: "radio",
          label: "Alinhamento vertical",
          options: [
            { label: "Topo", value: "start" },
            { label: "Centro", value: "center" },
          ],
        },
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
        col4: { type: "slot" },
      },
      defaultProps: { columns: 3, gap: "md", align: "start", col1: [], col2: [], col3: [], col4: [] },
      render: (props) => <LandingColumnsBlock {...props} />,
    },
    Texto: {
      label: "Texto",
      fields: {
        eyebrow: { type: "text", label: "Linha acima (opcional)" },
        title: { type: "text", label: "Título" },
        text: { type: "textarea", label: "Texto" },
        align: {
          type: "radio",
          label: "Alinhamento",
          options: [
            { label: "Esquerda", value: "left" },
            { label: "Centro", value: "center" },
          ],
        },
      },
      defaultProps: { eyebrow: "", title: "Título da seção", text: "Um parágrafo curto.", align: "center" },
      render: (props) => <LandingTextBlock {...props} />,
    },
    Vantagem: {
      label: "Vantagem",
      fields: {
        icon: {
          type: "select",
          label: "Ícone",
          options: Object.entries(FEATURE_ICONS).map(([value, { label }]) => ({ label, value })),
        },
        title: { type: "text", label: "Título" },
        text: { type: "textarea", label: "Texto" },
        style: {
          type: "radio",
          label: "Estilo",
          options: [
            { label: "Cartão", value: "card" },
            { label: "Simples", value: "plain" },
          ],
        },
      },
      defaultProps: { icon: "check", title: "Vantagem", text: "Uma frase sobre ela.", style: "card" },
      render: (props) => <LandingFeatureBlock {...props} />,
    },
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
            { label: "Formulário desta página", value: "form" },
            { label: "Quero alugar (app.cliente)", value: "lead" },
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
        target: "form",
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
        ...sectionStyleFields,
      },
      defaultProps: {
        title: "Nossa frota",
        onlyAvailable: false,
        max: 6,
        showAvailability: false,
        background: "white",
        spacing: "md",
        backgroundImage: "",
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
        ...sectionStyleFields,
      },
      defaultProps: {
        title: "Escolha o seu plano",
        showHighlights: false,
        background: "muted",
        spacing: "md",
        backgroundImage: "",
      },
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
        ...sectionStyleFields,
      },
      defaultProps: {
        title: "Pronto para começar?",
        text: "Deixe seu contato e responda algumas perguntas rápidas: leva 2 minutos.",
        buttonLabel: "Quero alugar",
        mode: "inline",
        background: "brand",
        spacing: "lg",
        backgroundImage: "",
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
        ...sectionStyleFields,
      },
      defaultProps: { title: "Perguntas frequentes", items: [], background: "white", spacing: "md", backgroundImage: "" },
      render: (props) => <LandingFaqBlock {...props} />,
    },
  },
};

const feature = (id: string, icon: string, title: string, text: string) => ({
  type: "Vantagem",
  props: { id, icon, title, text, style: "card" },
});

/**
 * First draft: hero, why us (a section with three advantages in columns),
 * the catalogue, the plans, the form on the brand red and the FAQ. Bands
 * alternate backgrounds, so the page is not one long white sheet.
 */
export const LANDING_INITIAL_DATA: Data = {
  root: { props: {} },
  content: [
    { type: "Destaque", props: { id: "destaque-1", ...landingConfig.components.Destaque.defaultProps, align: "center" } },
    {
      type: "Secao",
      props: {
        id: "secao-vantagens",
        background: "white",
        spacing: "lg",
        width: "normal",
        backgroundImage: "",
        content: [
          {
            type: "Texto",
            props: {
              id: "texto-vantagens",
              eyebrow: "Por que a Pista Livre",
              title: "Você roda, a gente cuida do resto",
              text: "Locação pensada para quem trabalha com o veículo todo dia.",
              align: "center",
            },
          },
          {
            type: "Colunas",
            props: {
              id: "colunas-vantagens",
              columns: 3,
              gap: "md",
              align: "start",
              col1: [feature("v1", "wrench", "Manutenção em dia", "Revisões e trocas de óleo no plano, sem surpresa no fim do mês.")],
              col2: [feature("v2", "wallet", "Pagamento que cabe", "Semanal ou mensal, por pix ou boleto, do jeito que você recebe.")],
              col3: [feature("v3", "headset", "Gente de verdade", "Atendimento pelo WhatsApp, com quem conhece a sua locação.")],
              col4: [],
            },
          },
        ],
      },
    },
    {
      type: "Catalogo",
      props: { id: "catalogo-1", ...landingConfig.components.Catalogo.defaultProps, background: "muted" },
    },
    { type: "Planos", props: { id: "planos-1", ...landingConfig.components.Planos.defaultProps, background: "white" } },
    { type: "QueroAlugar", props: { id: "quero-alugar-1", ...landingConfig.components.QueroAlugar.defaultProps } },
    {
      type: "Perguntas",
      props: {
        id: "perguntas-1",
        title: "Perguntas frequentes",
        background: "muted",
        spacing: "md",
        backgroundImage: "",
        items: [
          { question: "Preciso ter CNH?", answer: "Sim, CNH válida na categoria do veículo." },
          { question: "A manutenção está inclusa?", answer: "Revisões e trocas de óleo estão no plano; o restante a gente combina na locação." },
          { question: "Como pago?", answer: "Por pix ou boleto, na recorrência do seu plano." },
        ],
      },
    },
  ],
};
