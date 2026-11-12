import type { AiChatMode } from "@/types/ai";

/** The assistant's name: Pista LIVRE → Livrinho (and the little book that knows things). */
export const ASSISTANT_NAME = "Livrinho";

/** Opening lines, one at random each time the chat opens. `{nome}` = the person's first name. */
const OPENINGS: Record<AiChatMode, string[]> = {
  general: [
    "Abre o livrinho, {nome}: o que vamos descobrir hoje?",
    "E aí, {nome}! Qual página da Pista Livre a gente folheia agora?",
    "Livrinho aberto, {nome}. Pode perguntar!",
    "{nome}, tô com a frota, as locações e o caixa na ponta da língua.",
    "Bora, {nome}? Me pergunta qualquer coisa da operação.",
    "Que bom te ver, {nome}! No que eu ajudo hoje?",
    "Pista livre pra perguntar, {nome}. Manda!",
    "{nome}, qual capítulo de hoje: cobranças, clientes ou motos?",
  ],
  contract: [
    "Bora deixar esse contrato redondo, {nome}?",
    "{nome}, me diz o que mudar e eu ajusto o texto.",
    "Contrato aberto. O que a gente acerta, {nome}?",
  ],
  proposal: [
    "Vamos caprichar nessa proposta, {nome}?",
    "{nome}, me diz o tom e eu ajusto a proposta.",
  ],
  partner_contract: [
    "Vamos montar esse contrato de parceria, {nome}?",
    "{nome}, me diz o que o parceiro precisa e eu escrevo.",
  ],
};

/** What it can do, in one line under the opening. */
export const CAPABILITIES: Record<AiChatMode, string> = {
  general:
    "Pergunte sobre locações, clientes, cobranças e a frota, ou mande fotos e PDFs de documentos (Ctrl+V, arrastar ou o clipe) que eu cadastro.",
  contract:
    "Troco valores e prazos, incluo acordos e reviso o texto. Consulto a locação, o cliente e os planos quando precisar.",
  proposal:
    "Destaco o plano certo, mudo valores e deixo o texto mais direto. Consulto o lead e os planos quando precisar.",
  partner_contract:
    "Incluo cláusulas, ajusto prazos e a rescisão e explico a participação. Consulto o contrato, o parceiro e os veículos.",
};

/** One opening for this chat (with the name, or without it when unknown). */
export function pickOpening(
  mode: AiChatMode,
  firstName: string | null,
): string {
  const options = OPENINGS[mode];
  const line = options[Math.floor(Math.random() * options.length)];
  if (firstName) return line.replace("{nome}", firstName);
  // No name: drop it and the comma/space around it, then fix the first letter.
  const plain = line
    .replace(/,?\s*\{nome\}\s*,?\s*/, (match) =>
      match.includes(",") && !match.startsWith(",") ? "" : " ",
    )
    .replace(/\s+([!?.:])/g, "$1")
    .trim();
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}
