# Juros do parcelamento

- O painel administrativo agora tem um radio button com **Com juros** e **Sem juros**.
- O padrão para registros antigos é **Com juros**, evitando afirmar "sem juros" sem confirmação.
- A página pública mostra exatamente a opção escolhida pelo administrador.
- O sistema não tenta mais inferir juros comparando o total das parcelas com o preço atual.
- O cálculo automático do preço atual (parcelas × valor da parcela) continua funcionando.

Antes de publicar esta versão, execute uma vez `supabase/add-parcelamento-juros.sql` no SQL Editor do Supabase.
