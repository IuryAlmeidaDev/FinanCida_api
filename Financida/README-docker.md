# FinanCida com Docker

Este setup sobe a aplicacao Next.js junto com um banco Postgres.

## Subir

```bash
docker compose up --build
```

Acesse:

```bash
http://localhost:3000
```

## Parar

```bash
docker compose down
```

## Remover dados do banco

```bash
docker compose down -v
```

## Banco

O container usa:

```bash
DATABASE_URL=postgres://financida:financida_password@db:5432/financida
```

As tabelas sao criadas automaticamente pela API na primeira leitura/escrita.

## Autenticacao (Supabase)

O container tambem usa:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```
