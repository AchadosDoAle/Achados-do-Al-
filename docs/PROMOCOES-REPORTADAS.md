# Avisos de promoção vencida

Esta versão adiciona um sistema de confirmação comunitária nas páginas de ofertas.

- O visitante pode escolher: PROMOÇÃO VENCIDA, ACABOU ou NÃO ESTÁ ESSE PREÇO.
- Cada navegador recebe um identificador anônimo salvo localmente e só conta uma vez por oferta.
- Com 3 identificadores diferentes, a oferta muda automaticamente para status `expirada`.
- A oferta continua pública e acessível, porém aparece em cinza com a indicação PROMOÇÃO VENCIDA.
- No painel administrativo, ofertas expiradas ganham o botão `Reativar oferta`.
- Ao reativar, os avisos antigos são zerados e a contagem começa novamente.

## Supabase

Antes de publicar esta versão, execute uma única vez o arquivo:

`supabase/offer-reports.sql`

no SQL Editor do Supabase.
