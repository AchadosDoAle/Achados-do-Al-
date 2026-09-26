# Publicar e republicar ofertas direto da listagem — 2026-09-26

## Objetivo

Agilizar o trabalho no painel administrativo do Achado do Alê, evitando abrir a edição apenas para mudar o status de uma oferta.

## Comportamento

- **Rascunho:** exibe o botão **PUBLICAR** ao lado de **Excluir**.
- **Expirada:** exibe o botão **REPUBLICAR** ao lado de **Excluir**.
- **Arquivada:** exibe o botão **REPUBLICAR** ao lado de **Excluir**.
- **Validade vencida:** quando a oferta ainda está com status `publicada`, mas a data de validade já passou, exibe **REPUBLICAR**.

## O que acontece ao publicar

- status passa para `publicada`;
- `publicado_em` recebe a data/hora atual;
- eventual agendamento pendente é removido;
- os demais dados do produto permanecem inalterados.

## O que acontece ao republicar

Além do comportamento acima:

- se a validade cadastrada já passou, ela é removida para que a oferta não continue vencida imediatamente;
- se a oferta havia sido expirada pelo sistema de avisos dos visitantes, os avisos antigos são zerados pela função `reactivate_offer` antes da republicação.

## Banco de dados

Esta atualização não cria tabela nem coluna nova e não exige executar SQL no Supabase. Ela usa a estrutura e a função `reactivate_offer` que já existem no projeto.
