# Alteração de preços e parcelamento

- Preço no Pix virou o preço prioritário no formulário e na página pública.
- Preço no Pix e preço atual deixaram de ser obrigatórios.
- Foi adicionado o controle "O site oferece parcelamento?".
- Ao marcar Sim, aparecem quantidade de parcelas, valor da parcela e Com juros/Sem juros.
- O preço atual/total parcelado é calculado automaticamente por parcelas × valor da parcela.
- A página pública destaca o Pix sempre que ele existir.
- Se não houver Pix, o preço atual continua sendo usado como preço principal.
- Se nenhum dos dois existir, o site mostra "Consulte o preço atualizado no site da loja".

## SQL necessário
Execute uma vez no Supabase SQL Editor:

supabase/add-oferece-parcelamento-precos-opcionais.sql
