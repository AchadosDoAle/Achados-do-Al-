# Condição do frete

Nesta versão, a Etapa 3 de ofertas ganhou o campo **Condição do frete (opcional)**.

Exemplos:
- Frete grátis para assinantes Meli+
- Frete grátis para assinantes Amazon Prime
- Frete grátis acima de R$ 199
- Disponível apenas para determinadas regiões

A condição é salva no campo `frete_condicao` da tabela `offers` e exibida na página pública do produto.

Execute uma vez no SQL Editor do Supabase:

```sql
alter table public.offers
  add column if not exists frete_condicao text;
```
