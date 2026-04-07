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

## Autenticacao

O container tambem usa:

```bash
AUTH_JWT_SECRET=financida-session-secret
```
