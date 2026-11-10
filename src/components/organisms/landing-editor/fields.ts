import type { Field } from "@puckeditor/core";

/** "Fundo": the band's colour (or a picture, darkened for the text). */
export const backgroundField: Field = {
  type: "select",
  label: "Fundo",
  options: [
    { label: "Branco", value: "white" },
    { label: "Cinza claro", value: "muted" },
    { label: "Vermelho suave", value: "brandSoft" },
    { label: "Vermelho da marca", value: "brand" },
    { label: "Escuro", value: "dark" },
    { label: "Imagem (escurecida)", value: "image" },
  ],
};

export const spacingField: Field = {
  type: "radio",
  label: "Espaçamento",
  options: [
    { label: "Pequeno", value: "sm" },
    { label: "Médio", value: "md" },
    { label: "Grande", value: "lg" },
  ],
};

export const widthField: Field = {
  type: "radio",
  label: "Largura do conteúdo",
  options: [
    { label: "Estreita", value: "narrow" },
    { label: "Normal", value: "normal" },
    { label: "Cheia", value: "full" },
  ],
};

export const backgroundImageField: Field = {
  type: "text",
  label: "Imagem de fundo (link https, com o fundo \"Imagem\")",
};

/** The style fields every section-like block shows. */
export const sectionStyleFields = {
  background: backgroundField,
  spacing: spacingField,
  backgroundImage: backgroundImageField,
};
