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
(listar e **recusar**); Financeiro, Débitos e Extrato **só leitura**; Propostas e Assinaturas **só
leitura**; Projeções (conta no servidor + PDF). Portal do cliente **só leitura**. Shell novo com animações
(bottom sheet no celular, sem ação central na barra).

## O que falta (2026-11-08)

**Espera decisão do dono** (não implementar sem o "ok"):
- **Escritas que mexem em dinheiro**: emitir/editar/excluir cobrança, dar baixa, registrar recebimento, NF,
  pagamento de dívida, ligar/desligar cobrança automática da locação, trechos de valor, abonos, dias sem
  cobrança, descontos, pix recebidos.
- **Reembolso "marcar como pago"** (pago por fora): precisa de migration aditiva (`paidAt`/`paidAmount`).
- **Financeiro**: nota do extrato e marca "transferência interna" (mudam totais do contador).
- **Escritas do portal**: pedir reembolso, cadastrar chave pix, registrar manutenção/vistoria, trocar senha.
- **Escritas de Propostas e Assinaturas**: emitir/aceitar/recusar/excluir proposta; configurar, enviar,
  cancelar, reenviar assinatura (o backend ainda não tem essas rotas no v1).
- **Cadastro de cliente** já está liberado no webapp (faz upsert no Asaas, best-effort); confirmar com o
  dono, porque uma regra anterior deixava isso para ele.
- Divergência de valor da mesma cobrança: gestão R$ 730,16 × portal R$ 650 (já existia no Next).
- Token Bearer não cai ao trocar a senha (revogar exige migration).
- Dados de demonstração no dev (`db:seed:demo`), para parar de validar com simulação.
- Theming do portal (travar no claro?) e logo definitivo (`public/logo.svg` é provisório; depois
  `npm run pwa:assets`).

**Pode ser feito sem decisão**:
- Editor de modelo de contrato: seletor de variáveis ao digitar `{{` e realce das variáveis no texto.
- Seções recolhíveis animadas (`grid-rows-[0fr]→[1fr]`), resto do pedido de animações.

**Sucessos nunca testados de verdade no dev** (só com simulação): criar/editar cliente (upsert no Asaas),
recusar reembolso (só há pedido real), upload de documento (o S3 do dev está com credencial quebrada: abrir
e baixar arquivo dá 500) e envio do questionário (a sessão fica órfã). Ver `../pista-livre/docs/handoff-api-v1.md`.

**Para ir ao ar** (só com o aval do dono): merge da `feat/api-v1-spa` na `main` do `pista-livre` (o
Railway faz deploy da main), deploy deste SPA com domínio e `WEBAPP_ORIGIN` no backend, e só então remover
as páginas Next antigas.
