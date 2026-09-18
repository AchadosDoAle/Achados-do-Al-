# Ajustes: parcelamento e cupom

- O campo **Preço atual** passa a ser recalculado automaticamente quando quantidade de parcelas e valor da parcela estiverem preenchidos.
- Exemplo: 12 x R$ 34,72 = R$ 416,64.
- A Etapa 3 ganhou o campo **Descrição do cupom**.
- Código, descrição e link do cupom agora aparecem em um bloco próprio na página pública da oferta.
- Para a descrição funcionar em um banco Supabase já existente, execute `supabase/add-cupom-descricao-ofertas.sql` uma única vez.
