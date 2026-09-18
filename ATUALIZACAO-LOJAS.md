# Atualização das lojas afiliadas

Lojas configuradas no projeto:

- Mercado Livre
- Amazon
- Netshoes
- Magalu - Magazine Luiza
- Shopee
- ZZ Mall
- BAW
- AliExpress
- Natura
- Avon
- Outros

## Comportamento de "Outros"

Nos formulários de **nova/edição de oferta** e **novo/edição de cupom**, ao selecionar **Outros**, aparece automaticamente um campo **Digite o nome da loja**. O nome digitado é o que fica salvo no Supabase e o que aparece publicamente no site.

## Compatibilidade

Registros antigos com nomes como `Magalu` e `MercadoLivre` continuam funcionando e são exibidos com o nome padronizado. Não é necessário rodar novo SQL no Supabase para esta alteração, pois a coluna `loja` já é texto livre.
