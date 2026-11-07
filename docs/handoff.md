# Handoff — pistalivre-webapp

Documento vivo para a sessão (Claude) que assumir o frontend. Atualize ao passar o bastão.

## Contexto e autonomia

- O dono pediu para **sair do monolito**: este SPA consome a API `/api/v1` servida pelo Next do repo `pista-livre` (branch `feat/api-v1-spa`, mantida por uma sessão de backend, cujo handoff fica em `pista-livre/docs/handoff-api-v1.md`).
- Ele deu **autonomia** para seguir sem perguntar enquanto estiver fora, e pediu que, ao fim do contexto, o trabalho seja **repassado a uma sessão livre do frontend** (`pista-livre-48`, `pista-livre-38`, `pista-livre-dd`), com a mesma instrução: continuar trabalhando e repassar adiante. Quem assume avisa o par do backend com o novo nome.
- Regras combinadas com o backend:
  1. Nada vai para produção: sem deploy, sem domínio público. Aqui, commit e push na `main` deste repo podem.
  2. Não derrubar o container `dev` (:3000) nem o Vite (:5173); o dono usa os dois para olhar.
  3. Contrato por mensagem: peça o endpoint ao backend com o formato exato.
  4. Ao chegar perto do fim do contexto, atualizar este arquivo e repassar.
  5. Decisão ambígua: escolher o mais conservador, anotar aqui e seguir. Exceção: o que mexe em **dinheiro** (emitir, dar baixa ou editar cobrança, pix) ou em **dado de cliente** fica **somente leitura** até o dono decidir.
  6. Escopo: reproduzir no SPA as telas da gestão e depois as do portal. Apagar as páginas Next antigas só com o aval dele.

## Rodando

- API: `docker compose up dev` no `pista-livre` (já está de pé; **não reinicie**). Login `admin@pistalivre.dev` / `admin123`.
- Front: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort` (no WSL, `npm`/`node` são funções nvm que travam: use os binários em `/home/ojhon/.nvm/versions/node/v22.15.1/bin/`).
- Testes visuais: Puppeteer do `pista-livre/node_modules/puppeteer` (o Chrome dele está em `~/.cache/puppeteer`), em 390×844 (mobile) e 1366×820 (desktop).

## Regras do dono (inegociáveis)

- **Zero HTML nativo fora de `components/atoms`**, garantido pelo lint (`no-restricted-syntax`). Também não vale UI que o navegador desenha (`<select>` nativo foi rejeitado): use Radix/shadcn.
- **Nada de função solta**: `utils/` (pura), `helpers/` (depende do app), `hooks/` (depende do React).
- **Toda tela de dados tem skeleton no formato real**: `XSkeleton` exportado no mesmo arquivo do organism, page e skeleton pelo mesmo template, tudo dentro de `SkeletonRegion`. Refetch = lista esmaecida + `TopProgressBar`, nunca skeleton por cima de dado.
- **Layout com `Row`/`Col`** (grid de 12 colunas do dalila-ui, em `src/index.css`), nunca `grid-cols-*`.
- **Menu colapsável** no modelo do dalila-ui (`SidebarProvider`/`useSidebar`).
- Mobile first, PWA, interface em português, código em inglês, brand (`#E4141B`, regra 60/30/10).
- Sem saudação duplicada: "Olá, Fulano" só no header.
- **Sem subtítulo em página** ("acho muito feio"): o `PageHeader` só tem título e ações, sem `description`. Texto explicativo de estado vazio pode.

## Feito

- Base: Vite + React 19 + TanStack Query 5 + Router 7 + Tailwind 3 + PWA (prompt de atualização, banner offline).
- Auth da equipe por Bearer (`/auth/login`, `/auth/me`), guards com `callbackUrl`.
- Veículos: lista (busca, tipo da API, situação, paginação na URL, km e locatário) + detalhe (resumo, locação ativa, documentos com ver/baixar via blob).
- Shell: sidebar colapsável, gaveta no mobile, barra inferior, tema claro/escuro/sistema.
- Loaders: skeletons, barra de topo, páginas lazy.

## Próximo (em ordem)

1. **Locações**: lista + detalhe, com cobranças **somente leitura** (`GET /rentals`, `/rentals/:id`, `/rentals/:id/charges`). Mostre `amounts.amount` como valor principal e nunca recalcule multa no front.
2. **Rótulos**: carregar `GET /api/v1/labels` (público, 37 mapas) com `staleTime: Infinity` e parar de copiar rótulos para `constants/labels.ts`.
3. **Clientes**: lista + detalhe (`/customers`).
4. **Painel**: `/dashboard`. Saldo `null` = indisponível, **nunca R$ 0,00**.
5. Manutenções e vistorias (listas; os detalhes vêm do backend em seguida).
6. Portal do cliente (`/auth/customer/login` + rotas de cliente, quando o backend publicar).

## Pendências e decisões anotadas

- Logo `public/logo.svg` é provisório (um "P"); troque e rode `npm run pwa:assets`.
- No dev, o S3 está com credencial quebrada: abrir/baixar documento dá 500 (problema anterior a este trabalho).
- Barra inferior no mobile **mantida** junto com a gaveta (decisão minha; o dalila só tem a gaveta). Se o dono preferir, basta tirar `<BottomNav />` do `AppShell`.
