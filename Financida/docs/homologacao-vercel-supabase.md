# Homologacao com Vercel e Supabase

Este projeto deve ter ambientes separados para desenvolvimento, homologacao e producao.

O fluxo recomendado e:

```text
main      -> producao
develop   -> homologacao
branches  -> previews temporarios
```

## Objetivo

Manter a branch `main` apontando para producao e usar a branch `develop` como ambiente fixo de homologacao, com banco e secrets separados.

## Estrutura dos ambientes

### Producao

- Branch: `main`
- URL sugerida: `https://financida.com.br`
- Banco: Supabase/Postgres de producao
- Storage: bucket de producao
- Dados: reais

### Homologacao

- Branch: `develop`
- URL sugerida: `https://staging.financida.com.br`
- Banco: Supabase/Postgres separado
- Storage: bucket separado ou projeto Supabase separado
- Dados: testes

## Variaveis obrigatorias

Configure estas variaveis na Vercel:

```bash
DATABASE_URL=
AUTH_JWT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=avatars
```

`SUPABASE_*` so sao obrigatorias para o fluxo de upload de avatar.

## Configuracao na Vercel pelo painel

1. Abra o projeto na Vercel.
2. Va em `Settings > Git`.
3. Confirme que a branch de producao e `main`.
4. Va em `Settings > Environment Variables`.
5. Configure as variaveis de producao com escopo `Production`.
6. Configure as variaveis de homologacao com escopo `Preview` e restrinja para a branch `develop`.
7. Va em `Settings > Domains`.
8. Adicione um dominio para homologacao, por exemplo `staging.financida.com.br`.
9. Aponte esse dominio para o deployment da branch `develop`.

Importante: a branch `develop` deve usar um `DATABASE_URL` diferente da producao.

## Configuracao pela Vercel CLI

Dentro da pasta do projeto Next.js:

```bash
cd Financida
vercel link
```

Depois adicione as variaveis de producao:

```bash
vercel env add DATABASE_URL production
vercel env add AUTH_JWT_SECRET production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_STORAGE_BUCKET production
```

E as variaveis de homologacao para a branch `develop`:

```bash
vercel env add DATABASE_URL preview --git-branch=develop
vercel env add AUTH_JWT_SECRET preview --git-branch=develop
vercel env add SUPABASE_URL preview --git-branch=develop
vercel env add SUPABASE_SERVICE_ROLE_KEY preview --git-branch=develop
vercel env add SUPABASE_STORAGE_BUCKET preview --git-branch=develop
```

## Supabase

O caminho mais seguro e ter dois projetos Supabase:

```text
financida-prod
financida-staging
```

Se preferir usar um unico projeto Supabase no comeco, use pelo menos bancos/schemas e buckets separados. Ainda assim, dois projetos separados reduzem o risco de vazar ou alterar dados reais durante testes.

## Criando a branch develop

Se a branch ainda nao existir no remoto:

```bash
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

A partir dai, todo push para `develop` gera um deployment de homologacao na Vercel.

## Checklist antes de publicar em producao

Antes de fazer merge de `develop` para `main`:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Valide tambem em homologacao:

- cadastro de usuario
- login e logout
- dashboard
- criacao, edicao e exclusao de lancamentos
- perfil e avatar
- amigos e contas compartilhadas
- notificacoes

## Proximo passo tecnico recomendado

Hoje o projeto cria tabelas automaticamente conforme os modulos sao acessados. Para trabalhar bem com homologacao e producao, o ideal e evoluir para migrations versionadas.

Sem migrations, existe risco de homologacao e producao ficarem com estruturas de banco diferentes.
