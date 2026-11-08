# Pista Livre — Webapp

Frontend da plataforma Pista Livre (gestão de locadora de veículos), separado do monolito Next.js. É um SPA **mobile first** e **PWA** (instalável, com aviso de nova versão) que consome a API em `/api/v1`.

## Stack

React 19 + Vite 6 + TypeScript · TanStack Query 5 · React Router 7 · Tailwind 3 (tokens da marca em `src/index.css`) · react-hook-form + zod · `vite-plugin-pwa`.

## Rodando

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev              # http://localhost:5173
```

A API (repo `pista-livre`) precisa liberar a origem do webapp em `WEBAPP_ORIGIN` (default `http://localhost:5173`).

Scripts: `npm run build` (typecheck + build) · `npm run lint` (zero warnings) · `npm run format` · `npm run pwa:assets` (regenera os ícones a partir de `public/logo.svg`).

## Estrutura

Organizada **por domínio** nas camadas que mudam de área para área. Os **componentes são compartilhados**:

```
src/
  app/           App, providers (QueryClient, tooltip, sidebar, toasts, prompt do PWA), router e guards
  components/    COMPARTILHADOS entre gestão e portal, em Atomic Design:
                 atoms/ molecules/ organisms/ templates/ (uma pasta por componente, index.tsx)
  pages/
    gestao/      área da equipe (URLs /gestao/...)
    cliente/     portal do locatário (URLs /area-cliente/...)
    comum/       404, "em migração"
  hooks/
    api/
      gestao/    useQuery/useMutation da área da equipe (veículos, locações, login da equipe…)
      cliente/   idem, do portal (Bearer de cliente, rotas /me/*)
      comum/     o que as duas áreas usam (sessão /me, rótulos, arquivos)
    auth/        sessão (useSession, useAuthToken, useLogout)
    ui/          comportamento de tela (filtros na URL, rótulos, debounce, tema, sidebar, PWA)
  services/
    api/{gestao,cliente,comum}/   um <recurso>.service.ts por recurso, mesma divisão dos hooks
    http/client.ts                axios + Bearer + erro normalizado
  helpers/       lógica que depende do app (token, storage, erro da API, cobrança, grid, rótulos…)
  utils/         funções puras (cn, formatação, datas, placa)
  constants/     rotas, query keys, nomes dos mapas de rótulo, navegação, layout
  types/         contratos da API e do domínio
  config/        env validado com zod
```

## Convenções

- **Zero HTML nativo fora de `components/atoms`**: molecules, organisms, templates e pages só compõem componentes (`Box`, `Text`, `Heading`, `List`, `Form`, `Nav`…). Faltou um? Cria o atom. O lint barra (`no-restricted-syntax`).
- **Toda tela de dados tem skeleton no formato do conteúdo real**: cada organism exporta o seu `XSkeleton` no mesmo arquivo, e a page usa o mesmo template de layout nos dois estados. Sempre dentro de `SkeletonRegion` (aparece só depois de ~150 ms, sem pulo de layout, `aria-busy` + "Carregando…" para leitor de tela). Refetch com dado na tela não troca por skeleton: a lista esmaece (`isPlaceholderData`) e a `TopProgressBar` mostra a atividade. Páginas são lazy (`app/router/pages.ts`) com `PageSkeleton` de fallback.
- **Layout com Row/Col** (grid de 12 colunas estilo Bootstrap, gutter de 24px — o padrão da casa, em `src/index.css`). Use os atoms `Row`/`Col` (`<Col span={12} md={6}>`), nunca `grid-cols-*` solto. Espaço vertical entre linhas com `gap-y-*` no `Row`.
- **Nada de função solta em componente**: regra vai para `utils/` (pura), `helpers/` (depende do app) ou `hooks/` (depende de React).
- **Mobile first**: o estilo base é o do celular; `md:` em diante é o desktop. Alvos de toque com 44px. Navegação inferior no celular e sidebar no desktop, as duas a partir de `constants/navigation.ts`.
- **Código em inglês, interface em português**, URLs em português (`/veiculos`, `/entrar`).
- **Filtros de lista moram na URL** (dá para compartilhar, sobrevivem ao reload e ao botão voltar).
- **Query keys só pelo `queryKeys`** (`constants/query-keys.ts`).
- **O service worker não guarda resposta da API**: cache de dado é do React Query (cobrança desatualizada é pior que um erro de offline).
- Brand: `docs/brand-tokens.md` do repo `pista-livre` (vermelho `#E4141B`, regra 60/30/10).

## Contrato da API

Bearer token (`POST /v1/auth/login` → `{ token, user }`, `GET /v1/auth/me`). Erro: `{ error: { code, message, fields? } }`. Lista paginada: `{ items, total, page, pageSize }`.
