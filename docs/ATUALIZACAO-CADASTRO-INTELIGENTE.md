# Cadastro inteligente de ofertas

Esta versão simplifica o cadastro administrativo:

- A oferta pronta passa a ser colada na Etapa 1.
- O botão “Reconhecer texto e preencher campos” interpreta localmente o texto e tenta identificar loja, produto, categoria, preços, Pix, parcelamento, link, voltagem, modelo, cor, capacidade, cupom, frete e validade.
- O texto original da publicação é preservado exatamente como foi colado.
- A antiga etapa de geração de texto por IA foi retirada do fluxo principal, já que o texto é produzido externamente.
- Os demais campos continuam disponíveis para revisão manual.

## Expiração por data

Quando `validade_promocao` possui uma data anterior ao dia atual em Brasília, a oferta passa a ser exibida visualmente como esgotada mesmo que o status no banco ainda seja `publicada`.

Ofertas sem data de validade não são alteradas.

Não há alteração de banco de dados nesta atualização e não é necessário executar SQL.
