# CLAUDE.md — pistalivre-webapp

**Nova sessão? Leia primeiro `docs/COMECE-AQUI.md`** (estado, como rodar/publicar, pendências).

SPA do **Pista Livre** (gestão de locadora, nicho motofrete). Nasceu do desacoplamento do monolito Next
(`../pista-livre`), que passou a ser **só backend** em `/api/v1` (branch `feat/api-v1-spa`). O estado vivo,
peça por peça, fica em **`docs/handoff.md`**. Contrato da API em **`../pista-livre/docs/api-v1.md`**. O
modelo de negócio e o domínio estão no `CLAUDE.md` do `pista-livre`: **leia os dois antes de mexer**.

## Stack e comandos

React 19 + Vite 6 + TanStack Query 5 + React Router 7 + Tailwind 3 + Radix/shadcn, **mobile first** e
**PWA** (vite-plugin-pwa, prompt de atualização).

- Dev: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort`. O `.env.development.local`
  (fora do git) aponta o dev para a API local `:3000`; sem ele, o `.env`/`.env.local` mandam para a de **produção**.
- API: `docker compose up dev` no `pista-livre`, em `:3000`. Login `admin@pistalivre.dev` / `admin123`
  (5 erros = 15 min de bloqueio). Portal: `cliente.teste@pistalivre.dev` / `teste123`.
  **Login do Claude para testes visuais** (ADMIN, só no banco de dev, criado em 2026-11-13 com aval do dono):
  `claude@dev.com` / `Claude-tdnCSF8O`. Use este, e não o do dono, nos prints e no Puppeteer.
  Área do parceiro: `parceiro@dev.com.br` / `ParceiroDev-2026` (senha redefinida no dev em 2026-11-14 com aval do dono).
- Se a API não subir com `ERR_MODULE_NOT_FOUND`, o `node_modules` da imagem ficou velho:
  `docker compose build dev && docker compose up -d -V dev`.
- Antes de commitar: `npx tsc -b` + `npx eslint . --max-warnings 0` + o grep de HTML nativo (abaixo).
- Testes visuais: **`npm run shots -- [--area gestao|cliente|parceiro] [--theme dark] [--full] [--ai] /caminho…`**
  (`scripts/shots.mjs`: Puppeteer do `../pista-livre`, 390×844 e 1366×820, escrita bloqueada, saída em `shots/`).
  No Git Bash, prefixe `MSYS_NO_PATHCONV=1`. `--ai` liga o Livrinho (o dev não tem chave de IA). **Escrita
  sempre simulada**; nunca gravar em dado existente do dev. Portal com dados: `demo4@demo.pistalivre.dev` / CPF
  `21508234973` (Paulo Demo, locação ativa). O dev do Next pode cair por memória: `docker compose restart dev`.

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
- **Visual sóbrio, sem "cara de template"** (2026-11-13, 1.12.0): fonte Archivo (títulos semicondensados,
  números tabulares), cards planos sem sombra, badge retangular, **vermelho só na ação principal** e no ícone
  ativo do menu, gráfico de ranking em cor neutra (cor só quando significa algo), código (`LOC-…`) sem
  monoespaçada. Valide toda tela com print em 390 e 1366 antes de entregar.
  Toast: `toast` do Sonner, desenhado por `components/atoms/toaster` (card neutro, só o ícone colorido,
  embaixo à direita no desktop e no topo no celular); nada de `richColors`/`closeButton`. Row/Col tem
  `-mx-3` fora das camadas do Tailwind: `mx-0` não o anula (para faixa sem calha, use `Box` flex).
  **Seções vazias agrupadas**: numa página dentro de `EmptySectionsProvider` (locação na gestão e no portal), todo
  `ListCard`/`CollapsibleCard` vazio vira uma linha do card "Ainda sem registros" (`EmptySectionsCard`), com os
  botões dele; card feito à mão entra com `useEmptySection` (ex.: `rental-invoices-card`). Barra de rolagem fina e
  discreta é global (`index.css`).
- **O sistema NUNCA faz saída de dinheiro** (pix out, transferência, boleto): é sempre por fora.
- Dinheiro é calculado **no servidor** (multa/juros, projeção): o front nunca reimplementa a conta.
- `401` desloga; **`403` não** (logado sem permissão).

## Trabalho em paralelo

Várias sessões Claude podem mexer **na mesma pasta**: `git add <caminhos>` (nunca `-A`),
`git pull --rebase --autostash` antes do push, mudanças **aditivas** nos compartilhados (router, `pages.ts`,
`routes.ts`, `query-keys.ts`, `label-maps.ts`). **Push na `main` = deploy** (Vercel ligada ao GitHub): só com aval do dono;
sem aval, commit local ou push numa branch.

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
Tela **Manual** (`pages/gestao/manual`, 2026-11-13): o manual do backend (`GET /guide`) em estilo documentação —
índice por capítulo com busca à esquerda (`ManualIndex`), seção com passos numerados à direita (`ManualArticle`),
`?secao=<id>` endereça cada seção; no celular o índice vira busca + select. No Ctrl+K, resultado do manual abre a
seção nessa tela. **Funcionalidade nova entra no manual na mesma entrega** (no backend, `system-guide.ts`).
**Notificações** (2026-11-14, 1.14.0): sininho no header da gestão (`NotificationBell`, popover por dia, abrir marca como
lida e navega com `toAppPath`), tela Configurações › Notificações (`pages/gestao/notification-settings`: o que a
pessoa quer, push neste aparelho com "Enviar teste" e, para o ADMIN, o que cada grupo pode e o horário do resumo).
Push: `public/push-sw.js` importado pelo service worker gerado (`workbox.importScripts`), `helpers/push.ts` +
`usePushDevice` (a permissão só é pedida no clique). Em dev o service worker fica desligado: para testar push,
`npm run build && npm run preview`. Tempo real por `notification.created` (sala do usuário).
Convite "Ative as notificações" (`PushInvite`, no `AppShell`): aparece para quem não tem push NESTE aparelho; não
aparece no navegador do celular (lá vem antes o convite de instalar), com o navegador bloqueando ou sem chave no servidor;
o X adia 7 dias (`pl:push_invite_snooze`).
Busca universal **Ctrl+K** (`SearchPalette`, 2026-11-12): registros do servidor (`GET /search`) + telas,
ações e manual; ao criar tela/ação nova, acrescente em `constants/navigation.ts`/`constants/search.ts`.

## Deploy (Vercel) e domínios

Um projeto só na Vercel serve as duas áreas, cada uma no seu domínio, com prefixo de ambiente:
**`app.gestao.pistalivrelocacoes.com.br`** (equipe), **`app.cliente.pistalivrelocacoes.com.br`** (portal) e
**`app.parceiro.pistalivrelocacoes.com.br`** (área do parceiro: investidores e proprietários, só leitura); e o **site** em `pistalivrelocacoes.com.br` (o Next entrega a raiz com o SPA no modo landing: só a página publicada, `IS_LANDING_HOST`); um dia,
`dev.gestao`/`dev.cliente` funcionam igual, sem mudar código. O app procura o rótulo `gestao`/`cliente` no
endereço (`helpers/host-realm`) e, ao trocar de área, mantém o prefixo (`app.cliente` → `app.gestao`): a raiz
abre a área do domínio, e uma página da outra área vai para o domínio certo (`useHostRealmRedirect`, nos
guards `RequireAuth`/`RedirectIfAuthenticated`). Qualquer outro host (localhost, previews da Vercel) serve as
duas áreas, como no dev. Cada domínio guarda o seu login (localStorage por origem).
- `vercel.json`: build `npm run build`, saída `dist`, todo caminho cai no `index.html` (rotas do SPA) e `sw.js`
  sem cache (senão o aviso de nova versão do PWA não aparece).
- Variável de build na Vercel: `VITE_API_URL=https://pistalivrelocacoes.com.br/api` (entra no build: mudou,
  publica de novo).
- Projeto criado em 2026-11-08: `csjhonathans-projects/pistalivre-webapp` (conta pessoal, plano Hobby),
  produção em `https://pistalivre-webapp.vercel.app`; `VITE_API_URL` cadastrada em Production e Preview.
  GitHub ligado desde 2026-11-09: **push na `main` publica em produção** (outras branches = prévia). A CLI
  (`vercel deploy --prod`, pasta ligada em `.vercel/`) segue valendo.
- DNS no **Cloudflare** (o Registro.br só guarda o registro): `CNAME app.gestao`, `CNAME app.cliente` e `CNAME app.parceiro` para
  `460e80aaac8cf57f.vercel-dns-017.com` (o destino que a Vercel deu ao projeto), com a nuvem **cinza** (DNS only) até a Vercel emitir o certificado.
- No backend: `WEBAPP_ORIGIN=https://app.gestao.pistalivrelocacoes.com.br,https://app.cliente.pistalivrelocacoes.com.br,https://pistalivre-webapp.vercel.app,https://app.parceiro.pistalivrelocacoes.com.br`
  (um ambiente `dev.` novo entra nessa lista ou na variável do backend de dev).
- Testar local: `http://app.gestao.localhost:5173` e `http://app.cliente.localhost:5173` simulam os domínios (a API do
  dev só aceita `localhost:5173`, então lá só dá para ver os redirecionamentos).

**Endereços limpos (feito em 2026-11-09).** No domínio da área não há prefixo (`app.gestao.…/locacoes`,
`app.cliente.…/locacoes/123`): `constants/routes.ts` lê o host uma vez e deixa `GESTAO`/`PORTAL` vazios; cada
domínio registra só as rotas da sua área. Caminhos antigos com prefixo redirecionam (`RealmPrefixRedirect`), e um
caminho da outra área vai para o domínio dela. Em localhost e no vercel.app os prefixos continuam.



**Liberado pelo dono em 2026-11-08 ("vamos fazer tudo")**, em andamento com o backend (`pista-livre-99`),
na ordem: A) reembolso "marcar como pago" (migration aditiva), escritas do portal (feitas), nota do extrato e
"transferência interna", revogar o Bearer ao trocar a senha; B) cobranças (emitir avulsa, editar, cancelar,
baixa/recebimento, NF, cobrança automática, trechos de valor, abonos, dias sem cobrança, descontos, pix
recebidos) e pagamentos de dívida, com `Idempotency-Key` nas escritas que emitem; C) escritas de Propostas e
Assinaturas (feitas); D) `db:seed:demo`. Saída de dinheiro continua proibida.

Decisões do dono (2026-11-08): cadastro de cliente com upsert no Asaas **fica**; o valor da cobrança vencida
é **o da gestão nos dois lados** (o portal passa a mostrar multa e juros como a gestão: ajuste no backend);
portal **segue o tema do celular**; logo = **emblema do Next** (feito).

**No ar desde 2026-11-08 13:28** (autorizado pelo dono): a `feat/api-v1-spa` foi juntada na `main` do
`pista-livre` (df0985f, o Railway publicou), com `WEBAPP_ORIGIN` = app.gestao, app.cliente e
pistalivre-webapp.vercel.app. O SPA está na Vercel nos dois domínios. As telas Next antigas
foram **removidas em 2026-11-09** (aval do dono): `pistalivrelocacoes.com.br/`, `/gestao/*` e `/area-cliente/*`
redirecionam (307) para app.gestao/app.cliente.

**Sucessos nunca testados de verdade no dev** (só com simulação): criar/editar cliente (upsert no Asaas),
recusar reembolso (só há pedido real) e envio do questionário (a sessão fica órfã). Upload de
documento já foi testado de verdade (2026-11-08: enviar, abrir, baixar e excluir no cliente de teste). Ver `../pista-livre/docs/handoff-api-v1.md`.
