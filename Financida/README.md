# FinanCida

FinanCida e uma aplicacao web de gestao financeira pessoal com autenticacao, painel de controle, lancamentos, relatorios, limite mensal de gastos, notificacoes, conexoes entre amigos e contas compartilhadas.

O projeto foi construido com `Next.js` no `App Router`, usando a propria aplicacao como frontend e backend. A interface fica em `app/` e `components/`, enquanto a regra de negocio e a persistencia ficam concentradas em `lib/`.

## Principais funcionalidades

- Cadastro e login com sessao via cookie `httpOnly`
- Dashboard com resumo financeiro do mes
- Cadastro e edicao de receitas, despesas fixas e despesas variaveis
- Relatorios e graficos para acompanhamento financeiro
- Definicao de limite mensal de gastos
- Modulo de criptomoedas com cotacoes e historico do Bitcoin em BRL
- Lista de amigos com pedidos de amizade
- Contas compartilhadas entre amigos com aceite ou recusa
- Notificacoes para pedidos, contas pendentes e contas vencidas
- Perfil de usuario com avatar e ajustes visuais

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `shadcn/ui`
- `PostgreSQL`
- `Zod` para validacao
- `Vitest` para testes

## Como o sistema esta organizado

### Interface

- `app/`: paginas, layout global e rotas de API
- `components/`: dashboard, formularios, tabelas, navegacao e componentes visuais
- `hooks/`: hooks de notificacao, mobile e compartilhamento

### Regra de negocio e persistencia

- `lib/auth.ts`: token JWT, hash de senha e sessao
- `lib/auth-store.ts`: usuarios e autenticacao no banco
- `lib/finance-store.ts`: categorias, receitas e despesas
- `lib/friends-store.ts`: pedidos de amizade e amizades aceitas
- `lib/friend-accounts-store.ts`: contas compartilhadas entre amigos
- `lib/notifications-store.ts`: notificacoes persistidas e alertas de contas vencidas
- `lib/profile-store.ts`: nome exibido e configuracao de avatar
- `lib/spending-limit-store.ts`: limite mensal de gastos
- `lib/supabase-storage.ts`: upload de avatar para Supabase Storage
- `lib/postgres.ts`: conexao com PostgreSQL

## Fluxo principal da aplicacao

1. O usuario cria conta ou faz login.
2. A API autentica o usuario e grava um cookie de sessao assinado.
3. A area `/dashboard` valida a sessao e carrega os dados financeiros.
4. O usuario pode cadastrar movimentacoes, visualizar graficos, definir limite de gastos e acompanhar alertas.
5. O modulo social permite adicionar amigos e criar contas compartilhadas.
6. Quando uma conta compartilhada e aceita, o sistema sincroniza os lancamentos financeiros dos envolvidos.

## Persistencia de dados

O projeto usa `PostgreSQL` como banco principal. As tabelas sao criadas automaticamente pela aplicacao quando os modulos sao acessados pela primeira vez.

Hoje existem tabelas para:

- usuarios (`app_users`)
- receitas e despesas
- categorias financeiras
- amizades
- contas compartilhadas
- notificacoes
- limite de gastos

Observacao: a criacao automatica de schema ajuda no ambiente local e no MVP, mas para producao o ideal e evoluir para migrations versionadas.

## Variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto.

### Obrigatorias

```bash
DATABASE_URL="postgres://usuario:senha@localhost:5432/financida"
AUTH_JWT_SECRET="um-segredo-longo-e-seguro"
```

### Opcionais

Use apenas se quiser habilitar upload de avatar:

```bash
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
SUPABASE_STORAGE_BUCKET="avatars"
```

## Rodando localmente

### 1. Instale as dependencias

```bash
npm install
```

### 2. Suba o banco PostgreSQL

Voce pode usar um banco local seu ou subir com Docker.

### 3. Configure o `.env.local`

Preencha pelo menos `DATABASE_URL` e `AUTH_JWT_SECRET`.

### 4. Inicie o projeto

```bash
npm run dev
```

Aplicacao:

```bash
http://localhost:3000
```

## Rodando com Docker

O projeto ja possui `Dockerfile` e `docker-compose.yml`.

```bash
docker compose up --build
```

Aplicacao:

```bash
http://localhost:3000
```

O `docker-compose` sobe:

- a aplicacao Next.js
- um PostgreSQL 16

Para derrubar:

```bash
docker compose down
```

Para remover tambem o volume do banco:

```bash
docker compose down -v
```

Mais detalhes em [README-docker.md](./README-docker.md).

## Homologacao

Para configurar um ambiente de homologacao na Vercel usando a branch `develop` e um banco Supabase separado, veja [docs/homologacao-vercel-supabase.md](./docs/homologacao-vercel-supabase.md).

## Scripts disponiveis

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run typecheck
npm run format
```

## APIs principais

### Autenticacao

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Financeiro

- `GET /api/finance`
- `PUT /api/finance`
- `GET /api/finance/summary`
- `POST /api/finance/movements`
- `PUT /api/finance/movements`
- `DELETE /api/finance/movements`

### Perfil

- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/avatar`

### Social

- `GET /api/friends`
- `POST /api/friends`
- `GET /api/friend-accounts`
- `POST /api/friend-accounts`

### Notificacoes e configuracoes

- `GET /api/notifications`
- `GET /api/notifications-stream`
- `GET /api/spending-limit`
- `PUT /api/spending-limit`
- `GET /api/crypto`

## Qualidade e manutencao

O projeto ja tem testes para varias rotas e modulos de negocio, principalmente autenticacao, finance, perfil, notificacoes e recursos sociais.

Pontos importantes para a evolucao do sistema:

- padronizar migrations do banco
- melhorar a documentacao funcional e tecnica
- corrigir problemas de encoding em alguns textos com acento
- fortalecer observabilidade e tratamento de erros externos

## Estrutura resumida

```text
Financida/
  app/
    api/
    dashboard/
    signup/
  components/
    ui/
  hooks/
  lib/
  public/
  Dockerfile
  docker-compose.yml
```

## Status atual

O sistema ja possui funcionalidades reais de produto e nao esta so em fase de prototipo visual. Ele atende bem um cenario de MVP avancado, com backend acoplado ao frontend, persistencia em PostgreSQL, modulos financeiros e recursos colaborativos entre usuarios.
