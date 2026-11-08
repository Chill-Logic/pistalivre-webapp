# CLAUDE.md — pistalivre-webapp

SPA do **Pista Livre** (gestão de locadora, nicho motofrete). Nasceu do desacoplamento do monolito Next
(`../pista-livre`), que passou a ser **só backend** em `/api/v1` (branch `feat/api-v1-spa`). O estado vivo,
peça por peça, fica em **`docs/handoff.md`**. Contrato da API em **`../pista-livre/docs/api-v1.md`**. O
modelo de negócio e o domínio estão no `CLAUDE.md` do `pista-livre`: **leia os dois antes de mexer**.

## Stack e comandos

React 19 + Vite 6 + TanStack Query 5 + React Router 7 + Tailwind 3 + Radix/shadcn, **mobile first** e
**PWA** (vite-plugin-pwa, prompt de atualização).

- Dev: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort`. No WSL, `npm`/`node`/`npx` são
  funções nvm que travam: use `/home/ojhon/.nvm/versions/node/v22.15.1/bin/{node,npm,npx}`.
- API: `docker compose up dev` no `pista-livre`, em `:3000`. Login `admin@pistalivre.dev` / `admin123`
  (5 erros = 15 min de bloqueio). Portal: `cliente.teste@pistalivre.dev` / `teste123`.
- Antes de commitar: `npx tsc -b` + `npx eslint . --max-warnings 0` + o grep de HTML nativo (abaixo).
- Testes visuais: Puppeteer do `../pista-livre/node_modules/puppeteer`, em 390×844 e 1366×820. **Escrita
  sempre simulada** (interceptar a request); nunca gravar em dado existente do dev.

## Regras do dono (inegociáveis)

- **Zero HTML nativo fora de `components/atoms`** (lint `no-restricted-syntax`), nem UI que o navegador
  desenha (`<select>`, date picker nativo): use Radix/shadcn. Checagem:
  `grep -rE '<(div|p|span|h[1-6]|ul|li|dl|dt|dd|nav|aside|header|main|form|img|option)[ >]' src` fora de
  atoms tem que dar vazio.
- **Atomic design** (atoms/molecules/organisms/templates, pasta/index.tsx). **Nada de função solta**:
  `utils/` (pura), `helpers/` (depende do app), `hooks/` (React).
- `pages/`, `hooks/api/` e `services/api/` divididos em `gestao/`, `cliente/`, `comum/`; `components/` é
  único. URLs `/gestao/...` e `/area-cliente/...`.
- **Toda tela de dados tem skeleton no formato real** (`XSkeleton` no mesmo arquivo, `SkeletonRegion`).
  Refetch = lista esmaecida + `TopProgressBar`, nunca skeleton por cima de dado.
- Layout com **`Row`/`Col`** (grid de 12 colunas em `src/index.css`), nunca `grid-cols-*`.
- **Listagens = Lista × Tabela**: desktop com tabela padrão + paginação + itens por página; celular sempre
  cards, de 10 em 10 (infinite). Receita no handoff (`usePagedList`, `DataTable` por colunas,
  `ViewToggle`, `ListFooter`).
- **Sem subtítulo em página**; saudação só no header. Interface em português, código em inglês. Brand
  `#E4141B`, regra 60/30/10.
- Telas de simulação/comparação (ex.: Projeções): **tabela densa editável no desktop**, cards só no celular.
  O PDF da projeção é o botão **"Relatório"**.
- **O sistema NUNCA faz saída de dinheiro** (pix out, transferência, boleto): é sempre por fora.
- Dinheiro é calculado **no servidor** (multa/juros, projeção): o front nunca reimplementa a conta.
- `401` desloga; **`403` não** (logado sem permissão).

## Trabalho em paralelo

Várias sessões Claude podem mexer **na mesma pasta**: `git add <caminhos>` (nunca `-A`),
`git pull --rebase --autostash` antes do push, mudanças **aditivas** nos compartilhados (router, `pages.ts`,
`routes.ts`, `query-keys.ts`, `label-maps.ts`). Push na `main` deste repo pode; **deploy não**.

## O que já existe (resumo — detalhe no handoff)

Gestão inteira fora o que move dinheiro: Painel; Veículos, Clientes, Locações, CRM (lead, estágio,
perda/retomada, atividades, questionário), Fornecedores (+ vínculos), Planos, Usuários (admin × agente),
Modelos de contrato e Manutenções com CRUD; Documentos (enviar/renomear/excluir); Vistorias; Reembolsos
(listar e **recusar**); Financeiro, Débitos e Extrato **só leitura**; Propostas e Assinaturas com escrita (C:
nova proposta com prévia/IA/PDF, aceitar/recusar/excluir/converter; assinatura nova, configurar, signatários,
solicitar, cancelar, confirmar, reenviar, vincular envelope); Projeções (conta no servidor + PDF). Portal do cliente com as escritas (senha, carteira pix, pedir reembolso, manutenção, vistoria). Extrato do aluguel (tela + PDF) na gestão e no portal; dias abonados intercalados nas cobranças. Shell novo com animações
(bottom sheet no celular, sem ação central na barra). Locação: cobrança automática e regras do aluguel
(acerto, valores no tempo, abonos, descontos, pix recebidos) com escrita (B5). Cobrança avulsa (unitária e
parcelada), registrar recebimento fora do Asaas, "Sincronizar do Asaas" e NF (locação, cliente e avulsa,
cancelar, vincular) com escrita (B2/B4).

## O que falta (2026-11-08)

**Liberado pelo dono em 2026-11-08 ("vamos fazer tudo")**, em andamento com o backend (`pista-livre-99`),
na ordem: A) reembolso "marcar como pago" (migration aditiva), escritas do portal (feitas), nota do extrato e
"transferência interna", revogar o Bearer ao trocar a senha; B) cobranças (emitir avulsa, editar, cancelar,
baixa/recebimento, NF, cobrança automática, trechos de valor, abonos, dias sem cobrança, descontos, pix
recebidos) e pagamentos de dívida, com `Idempotency-Key` nas escritas que emitem; C) escritas de Propostas e
Assinaturas (feitas); D) `db:seed:demo`. Saída de dinheiro continua proibida.

Decisões do dono (2026-11-08): cadastro de cliente com upsert no Asaas **fica**; o valor da cobrança vencida
é **o da gestão nos dois lados** (o portal passa a mostrar multa e juros como a gestão: ajuste no backend);
portal **segue o tema do celular**; logo = **emblema do Next** (feito).

**Só com o "pode" explícito do dono**: merge da `feat/api-v1-spa` na `main` do `pista-livre` (o Railway faz
deploy), deploy deste SPA com domínio e `WEBAPP_ORIGIN`, e só então remover as páginas Next antigas.

**Sucessos nunca testados de verdade no dev** (só com simulação): criar/editar cliente (upsert no Asaas),
recusar reembolso (só há pedido real) e envio do questionário (a sessão fica órfã). Upload de
documento já foi testado de verdade (2026-11-08: enviar, abrir, baixar e excluir no cliente de teste). Ver `../pista-livre/docs/handoff-api-v1.md`.
