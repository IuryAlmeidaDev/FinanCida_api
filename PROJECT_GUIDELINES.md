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
