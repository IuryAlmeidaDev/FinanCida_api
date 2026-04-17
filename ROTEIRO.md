# FinanCida Dashboard - Diretrizes do Projeto

## Clean Code

- **Sem comentarios desnecessarios**: codigo deve ser autoexplicativo. Comentarios so quando a logica nao e obvia.
- **Funcoes pequenas**: cada funcao faz uma coisa so. Se precisar de scroll, esta grande demais.
- **Classes/modulos enxutos**: separar responsabilidades. Um arquivo nao deve acumular multiplas concerns.
- **Nomes descritivos**: funcoes, variaveis e arquivos com nomes que dizem o que fazem. Evitar abreviacoes obscuras. Preferir `getUserById` a `getUsr` ou `fetch`.
- **Separacao de responsabilidades**: logica de negocio separada de I/O, controllers separados de services.
- **DRY com bom senso**: eliminar duplicacao real, mas nao criar abstracoes prematuras.
- **Sempre conferir reaproveitamento**: antes de criar um componente ou funcao, verificar se ja existe algo similar no projeto que possa ser reutilizado. Evitar duplicacoes e componentes com estilos divergentes.

## Componentes UI - shadcn/ui

- Componentes de interface devem se basear nos componentes do **shadcn/ui** (Radix-based).
- Referencia: https://ui.shadcn.com/docs/components/radix/sidebar (sidebar como exemplo).
- Usar os primitivos do shadcn como base, customizando por cima quando necessario.
- Antes de criar qualquer componente de UI, verificar se existe equivalente no shadcn.

## Testes no Backend

- **Todo codigo backend deve ter testes unitarios e de integracao.**
- Testes unitarios para services e logica de negocio.
- Testes de integracao para rotas/endpoints.
- Ao criar ou modificar qualquer modulo do backend, incluir/atualizar os testes correspondentes.

## Backlog do Produto

### Essencial

- Persistir perfil no banco: nome, avatar e preferencias.
- Editar e excluir lancamentos com UX refinada.
- Criar centro de vencimentos com contas dos proximos dias.
- Adicionar metas por categoria.
- Exibir historico completo por amigo.
- Criar busca de amigos por `handle`.
- Implementar exportacao real em `.xlsx`.
- Melhorar estados vazios para usuario novo.
- Implementar recuperacao e alteracao de senha.
- Refinar responsividade mobile nas telas principais.

### Diferencial

- Implementar modulo de cartao de credito com fatura, limite e parcelas.
- Criar previsao de saldo ate o fim do mes.
- Exibir orcado vs realizado.
- Adicionar relatorios comparativos por mes.
- Permitir importacao de CSV bancario.
- Criar divisao de contas em grupo.
- Adicionar aprovacao dupla em transacoes compartilhadas.
- Implementar notificacoes em tempo real de verdade.
- Criar alertas de gasto fora do padrao.
- Adicionar insights automaticos no dashboard.

### Premium

- Implementar modo casal/familia com financas compartilhadas.
- Separar financas pessoais e profissionais.
- Criar simulador financeiro.
- Adicionar gestao de dividas com juros, multa e estrategia de quitacao.
- Criar carteira cripto do usuario com rentabilidade em BRL.
- Adicionar alertas de preco de criptomoedas.
- Implementar chat simples por transacao ou amizade.
- Adicionar gamificacao de metas.
- Implementar 2FA e gestao de sessoes.
- Criar painel admin com metricas e auditoria.

### Ordem Recomendada

1. Persistencia de perfil
2. Centro de vencimentos
3. Metas por categoria
4. Exportacao `.xlsx`
5. Busca de amigos por `handle`
6. Cartao de credito
7. Previsao de saldo
8. Importacao CSV
9. Notificacoes em tempo real reais
10. Divisao de contas em grupo
