Atualização — padronização em caixa alta no painel administrativo

Nesta versão, os campos textuais de oferta e cupom passam a ser digitados e salvos em CAIXA ALTA.

Exceções solicitadas:
- Loja
- Categoria
- Frete grátis (checkbox)

Exceções técnicas preservadas para evitar quebra de dados:
- links/URLs
- datas e horários
- valores numéricos
- seletores de status
- upload de arquivos

A normalização ocorre durante a digitação e novamente antes de salvar, de modo que registros editados também são padronizados.

Não é necessário executar SQL no Supabase para esta atualização.
