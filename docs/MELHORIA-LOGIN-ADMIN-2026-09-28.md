# Melhoria da tela de login administrativo — 28/09/2026

## Alterações

- Reformulação visual da página `/login` do painel administrativo.
- Correção da legibilidade dos campos de e-mail e senha: fundo branco, texto escuro e cursor visível.
- Aplicação de `colorScheme: "light"` nos campos para neutralizar o `color-scheme: dark` global do projeto nos controles nativos do navegador.
- Adição de botão com ícone de olho para alternar entre senha oculta e visível.
- Melhoria de foco, placeholders e mensagens de erro/recuperação.
- Inclusão de `autocomplete` adequado para e-mail e senha.
- Layout responsivo preservado para desktop e mobile.

## Banco de dados

Nenhuma alteração no Supabase ou em SQL é necessária para esta atualização.
