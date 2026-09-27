# Pesquisa administrativa de ofertas e cupons — 26/09/2026

## O que mudou

As páginas `/admin/ofertas` e `/admin/cupons` agora possuem um campo de pesquisa antes da listagem.

### Como pesquisar

1. Digite qualquer parte do nome ou informação desejada.
2. Pressione **Enter** ou clique em **Pesquisar**.
3. Use **Limpar** para voltar a exibir todos os registros.

A pesquisa:

- não diferencia letras maiúsculas de minúsculas;
- ignora acentos;
- ignora pontuação;
- encontra partes do texto;
- aceita vários termos simultaneamente.

Exemplo: `relogio casio` encontra uma oferta cujo título seja `Relógio Masculino Casio`, mesmo que a grafia pesquisada não use acento.

## Ofertas

A pesquisa considera título, loja, categoria, marca, modelo, cupom, status, textos da publicação, observações, características e link do produto.

Também é possível buscar termos como `rascunho`, `arquivada`, `expirada` ou `vencida`.

## Cupons

A pesquisa considera código do cupom, loja, descrição, observações, valor/desconto, validade, status e link de produtos.

Também é possível localizar registros usando termos como `ativo`, `inativo`, `arquivado`, `vencido`, `expirado` ou `esgotado`.

## Banco de dados

Nenhuma alteração de banco de dados ou SQL é necessária. O filtro atua sobre os registros que a listagem administrativa já carrega do Supabase.
